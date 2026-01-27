import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorklogFilling } from 'src/common/entities/worklogs/worklog-12-filling.entity';
import { CreateFillingWorklogDto, FillingWorklogListResponseDto, UpdateFillingWorklogDto } from 'src/common/dtos/worklog/12-filling.dto';
import { MaterialService } from 'src/modules/material/material.service';
import { EquipmentService } from 'src/modules/equipment/equipment.service';
import { MaterialProcess } from 'src/common/enums/material.enum';

@Injectable()
export class FillingService {
  constructor(
    @InjectRepository(WorklogFilling)
    private readonly worklogFillingRepository: Repository<WorklogFilling>,
    private readonly materialService: MaterialService,
    private readonly equipmentService: EquipmentService,
  ) {}

  async createFillingWorklog(productionId: number, dto: CreateFillingWorklogDto): Promise<WorklogFilling> {
    const worklog = this.worklogFillingRepository.create({
      ...dto,
      production: { id: productionId },
    });
    const savedWorklog = await this.worklogFillingRepository.save(worklog);

    // 자재 사용 이력 기록 (electrolyte)
    if (dto.electrolyteLot && dto.electrolyteUsage && dto.electrolyteUsage > 0) {
      await this.materialService.recordMaterialUsage(dto.electrolyteLot, undefined, dto.electrolyteUsage, MaterialProcess.ELECTRODE);
    }

    return savedWorklog;
  }

  async getWorklogs(productionId: number): Promise<FillingWorklogListResponseDto[]> {
    const worklogs = await this.worklogFillingRepository.find({
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
    const worklog = await this.worklogFillingRepository.findOne({
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

  async updateFillingWorklog(worklogId: string, updateFillingWorklogDto: UpdateFillingWorklogDto): Promise<WorklogFilling> {
    const worklog = await this.worklogFillingRepository.findOne({ where: { id: +worklogId } });

    if (!worklog) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }

    // 변경 전 electrolyteUsage 저장
    const previousElectrolyteUsage = worklog.electrolyteUsage || 0;

    Object.assign(worklog, updateFillingWorklogDto);
    const savedWorklog = await this.worklogFillingRepository.save(worklog);

    // 자재 사용 이력 수정 - 사용량이 변경된 경우
    const newElectrolyteUsage = updateFillingWorklogDto.electrolyteUsage || 0;
    if (updateFillingWorklogDto.electrolyteLot && newElectrolyteUsage !== previousElectrolyteUsage) {
      await this.materialService.updateMaterialUsageHistory(
        updateFillingWorklogDto.electrolyteLot,
        undefined,
        newElectrolyteUsage,
        MaterialProcess.ELECTRODE,
      );
    }

    return savedWorklog;
  }

  async deleteFillingWorklog(worklogId: string): Promise<void> {
    const worklog = await this.worklogFillingRepository.findOne({ where: { id: +worklogId } });

    if (!worklog) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }
    await this.worklogFillingRepository.remove(worklog);
  }
}
