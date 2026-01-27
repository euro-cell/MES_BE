import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorklogWelding } from 'src/common/entities/worklogs/worklog-10-welding.entity';
import { CreateWeldingWorklogDto, WeldingWorklogListResponseDto, UpdateWeldingWorklogDto } from 'src/common/dtos/worklog/10-welding.dto';
import { MaterialService } from 'src/modules/material/material.service';
import { EquipmentService } from 'src/modules/equipment/equipment.service';
import { MaterialProcess } from 'src/common/enums/material.enum';

@Injectable()
export class WeldingService {
  constructor(
    @InjectRepository(WorklogWelding)
    private readonly worklogWeldingRepository: Repository<WorklogWelding>,
    private readonly materialService: MaterialService,
    private readonly equipmentService: EquipmentService,
  ) {}

  async createWeldingWorklog(productionId: number, dto: CreateWeldingWorklogDto): Promise<WorklogWelding> {
    const worklog = this.worklogWeldingRepository.create({
      ...dto,
      production: { id: productionId },
    });
    const savedWorklog = await this.worklogWeldingRepository.save(worklog);

    // 자재 사용 이력 기록 (leadTab, piTape)
    // leadTab: leadTabLot, leadTabUsage
    if (dto.leadTabLot && dto.leadTabUsage && dto.leadTabUsage > 0) {
      await this.materialService.recordMaterialUsage(dto.leadTabLot, undefined, dto.leadTabUsage, MaterialProcess.ELECTRODE);
    }

    // piTape: piTapeLot, piTapeUsage
    if (dto.piTapeLot && dto.piTapeUsage && dto.piTapeUsage > 0) {
      await this.materialService.recordMaterialUsage(dto.piTapeLot, undefined, dto.piTapeUsage, MaterialProcess.ELECTRODE);
    }

    return savedWorklog;
  }

  async getWorklogs(productionId: number): Promise<WeldingWorklogListResponseDto[]> {
    const worklogs = await this.worklogWeldingRepository.find({
      where: { production: { id: productionId } },
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
    const worklog = await this.worklogWeldingRepository.findOne({
      where: { id: +worklogId },
      relations: ['production'],
    });

    if (!worklog) {
      return null;
    }

    // plant ID를 plant name으로 변환
    let plantName: string | null = null;
    if (worklog.plant) {
      plantName = await this.equipmentService.findNameById(worklog.plant);
    }

    const { production, plant, ...rest } = worklog;
    return {
      ...rest,
      productionId: production?.name || '',
      plant: plantName,
    };
  }

  async updateWeldingWorklog(worklogId: string, updateWeldingWorklogDto: UpdateWeldingWorklogDto): Promise<WorklogWelding> {
    const worklog = await this.worklogWeldingRepository.findOne({ where: { id: +worklogId } });

    if (!worklog) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }

    // 변경 전 usage 저장
    const previousLeadTabUsage = worklog.leadTabUsage || 0;
    const previousPiTapeUsage = worklog.piTapeUsage || 0;

    Object.assign(worklog, updateWeldingWorklogDto);
    const savedWorklog = await this.worklogWeldingRepository.save(worklog);

    // 자재 사용 이력 수정 - 사용량이 변경된 경우
    // leadTab
    const newLeadTabUsage = updateWeldingWorklogDto.leadTabUsage || 0;
    if (updateWeldingWorklogDto.leadTabLot && newLeadTabUsage !== previousLeadTabUsage) {
      await this.materialService.updateMaterialUsageHistory(
        updateWeldingWorklogDto.leadTabLot,
        undefined,
        newLeadTabUsage,
        MaterialProcess.ELECTRODE,
      );
    }

    // piTape
    const newPiTapeUsage = updateWeldingWorklogDto.piTapeUsage || 0;
    if (updateWeldingWorklogDto.piTapeLot && newPiTapeUsage !== previousPiTapeUsage) {
      await this.materialService.updateMaterialUsageHistory(
        updateWeldingWorklogDto.piTapeLot,
        undefined,
        newPiTapeUsage,
        MaterialProcess.ELECTRODE,
      );
    }

    return savedWorklog;
  }

  async deleteWeldingWorklog(worklogId: string): Promise<void> {
    const worklog = await this.worklogWeldingRepository.findOne({ where: { id: +worklogId } });

    if (!worklog) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }
    await this.worklogWeldingRepository.remove(worklog);
  }
}
