import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { WorklogStacking } from 'src/common/entities/worklog/worklog-09-stacking.entity';
import {
  CreateStackingWorklogDto,
  StackingWorklogListResponseDto,
  UpdateStackingWorklogDto,
} from 'src/common/dtos/worklog/09-stacking.dto';
import { MaterialService } from 'src/modules/material/material.service';
import { EquipmentService } from 'src/modules/equipment/equipment.service';
import { MaterialProcess } from 'src/common/enums/material.enum';

@Injectable()
export class StackingService {
  constructor(
    @InjectRepository(WorklogStacking)
    private readonly worklogStackingRepository: Repository<WorklogStacking>,
    private readonly materialService: MaterialService,
    private readonly equipmentService: EquipmentService,
  ) {}

  async createStackingWorklog(projectId: number, dto: CreateStackingWorklogDto): Promise<WorklogStacking> {
    const worklog = this.worklogStackingRepository.create({
      ...dto,
      project: { id: projectId },
    });
    const savedWorklog = await this.worklogStackingRepository.save(worklog);

    if (dto.separatorLot && dto.separatorUsage && dto.separatorUsage > 0) {
      await this.applySeparatorUsage(dto.separatorLot, dto.separatorUsage);
    }

    return savedWorklog;
  }

  private parseSeparatorLots(separatorLot: string): string[] {
    return separatorLot.split(',').map(l => l.trim()).filter(Boolean);
  }

  // lot1 재고 먼저 소진, 나머지를 lot2에서 차감
  private async applySeparatorUsage(separatorLot: string, totalUsage: number): Promise<void> {
    const lots = this.parseSeparatorLots(separatorLot);
    if (lots.length === 0) return;

    if (lots.length === 1) {
      await this.materialService.recordMaterialUsage(lots[0], undefined, totalUsage, MaterialProcess.ASSEMBLY);
      return;
    }

    const lot1Material = await this.materialService.findMaterialByLot(lots[0]);
    const lot1Stock = lot1Material?.stock ?? 0;
    const lot1Usage = Math.min(lot1Stock, totalUsage);
    const lot2Usage = totalUsage - lot1Usage;

    if (lot1Usage > 0) {
      await this.materialService.recordMaterialUsage(lots[0], undefined, lot1Usage, MaterialProcess.ASSEMBLY);
    }
    if (lot2Usage > 0) {
      await this.materialService.recordMaterialUsage(lots[1], undefined, lot2Usage, MaterialProcess.ASSEMBLY);
    }
  }

  // lot2 이력 기반으로 먼저 복구, 나머지를 lot1에서 복구 (차감 역순)
  private async restoreSeparatorUsage(separatorLot: string, totalUsage: number): Promise<void> {
    const lots = this.parseSeparatorLots(separatorLot);
    if (lots.length === 0) return;

    if (lots.length === 1) {
      await this.materialService.restoreMaterialUsage(lots[0], undefined, totalUsage, MaterialProcess.ASSEMBLY);
      return;
    }

    const lot2Restored = await this.materialService.restoreMaterialUsageByHistory(lots[1], MaterialProcess.ASSEMBLY);
    const lot1Usage = totalUsage - lot2Restored;
    if (lot1Usage > 0) {
      await this.materialService.restoreMaterialUsage(lots[0], undefined, lot1Usage, MaterialProcess.ASSEMBLY);
    }
  }

  async getWorklogs(projectId: number): Promise<StackingWorklogListResponseDto[]> {
    const worklogs = await this.worklogStackingRepository.find({
      where: { project: { id: projectId } },
      order: { manufactureDate: 'ASC', createdAt: 'ASC' },
    });
    const dateRoundMap = new Map<string, number>();

    const worklogsWithRound = worklogs.map((worklog) => {
      const dateKey = worklog.manufactureDate.toString();
      const currentRound = dateRoundMap.get(dateKey) || 0;
      const round = currentRound + 1;
      dateRoundMap.set(dateKey, round);

      return {
        id: worklog.id,
        workDate: worklog.manufactureDate.toString(),
        round: round,
        writer: worklog.writer || '',
      };
    });
    return worklogsWithRound.reverse();
  }

  async findWorklogById(worklogId: string) {
    const worklog = await this.worklogStackingRepository.findOne({
      where: { id: +worklogId },
      relations: ['project'],
    });

    if (!worklog) {
      return null;
    }

    // plant ID를 plant name으로 변환
    let plantName: string | null = null;
    if (worklog.plant) {
      plantName = await this.equipmentService.findNameById(worklog.plant);
    }

    const { project, plant, ...rest } = worklog;
    return {
      ...rest,
      projectId: project?.name || '',
      plant: plantName,
    };
  }

  async updateStackingWorklog(worklogId: string, updateStackingWorklogDto: UpdateStackingWorklogDto): Promise<WorklogStacking> {
    const worklog = await this.worklogStackingRepository.findOne({ where: { id: +worklogId } });

    if (!worklog) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }

    // 변경 전 값 저장
    const previousSeparatorLot = worklog.separatorLot;
    const previousSeparatorUsage = worklog.separatorUsage || 0;

    Object.assign(worklog, updateStackingWorklogDto);
    const savedWorklog = await this.worklogStackingRepository.save(worklog);

    // 자재 사용 이력 수정 - lot 또는 사용량이 변경된 경우 이전 이력 복구 후 재차감
    const newSeparatorLot = updateStackingWorklogDto.separatorLot;
    const newSeparatorUsage = updateStackingWorklogDto.separatorUsage ?? previousSeparatorUsage;

    const lotChanged = newSeparatorLot !== undefined && newSeparatorLot !== previousSeparatorLot;
    const usageChanged = updateStackingWorklogDto.separatorUsage !== undefined && newSeparatorUsage !== previousSeparatorUsage;

    if ((lotChanged || usageChanged) && previousSeparatorLot && previousSeparatorUsage > 0) {
      await this.restoreSeparatorUsage(previousSeparatorLot, previousSeparatorUsage);
    }
    if ((lotChanged || usageChanged) && newSeparatorLot && newSeparatorUsage > 0) {
      await this.applySeparatorUsage(newSeparatorLot, newSeparatorUsage);
    }

    return savedWorklog;
  }

  async deleteStackingWorklog(worklogId: string): Promise<void> {
    const worklog = await this.worklogStackingRepository.findOne({ where: { id: +worklogId } });

    if (!worklog) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }

    // 삭제 전 자재 사용량 재고 복구
    if (worklog.separatorLot && worklog.separatorUsage && worklog.separatorUsage > 0) {
      await this.restoreSeparatorUsage(worklog.separatorLot, worklog.separatorUsage);
    }

    try {
      await this.worklogStackingRepository.remove(worklog);
    } catch (error) {
      if (error instanceof QueryFailedError && (error as unknown as { code?: string }).code === '23503') {
        throw new ConflictException('이 작업일지는 이미 Lot 관리로 동기화되어 삭제할 수 없습니다. 연결된 Lot을 먼저 확인해주세요.');
      }
      throw error;
    }
  }
}
