import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorklogBinder } from 'src/common/entities/worklogs/worklog-01-binder.entity';
import { CreateBinderWorklogDto, BinderWorklogListResponseDto, UpdateBinderWorklogDto } from 'src/common/dtos/worklog/01-binder.dto';
import { MaterialService } from 'src/modules/material/material.service';
import { EquipmentService } from 'src/modules/equipment/equipment.service';
import { MaterialProcess } from 'src/common/enums/material.enum';

@Injectable()
export class BinderService {
  constructor(
    @InjectRepository(WorklogBinder)
    private readonly worklogBinderRepository: Repository<WorklogBinder>,
    private readonly materialService: MaterialService,
    private readonly equipmentService: EquipmentService,
  ) {}

  async createBinderWorklog(productionId: number, dto: CreateBinderWorklogDto): Promise<WorklogBinder> {
    // pdMixerName을 pdMixerId로 변환
    let pdMixerId: number | null = null;
    if (dto.pdMixerName) {
      pdMixerId = await this.equipmentService.findIdByName(dto.pdMixerName);
    }

    const { pdMixerName, ...createData } = dto;
    const worklog = this.worklogBinderRepository.create({
      ...createData,
      production: { id: productionId },
      pdMixerId,
    });
    const savedWorklog = await this.worklogBinderRepository.save(worklog);

    // 자재 사용 이력 기록 (material1~2)
    for (let i = 1; i <= 2; i++) {
      const materialName = dto[`material${i}Name`];
      const materialLot = dto[`material${i}Lot`];
      const actualInput = dto[`material${i}ActualInput`];

      if (materialName && actualInput && actualInput > 0) {
        await this.materialService.recordMaterialUsage(materialName, materialLot, actualInput, MaterialProcess.ELECTRODE);
      }
    }

    return savedWorklog;
  }

  async getWorklogs(productionId: number): Promise<BinderWorklogListResponseDto[]> {
    const worklogs = await this.worklogBinderRepository.find({
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
    const worklog = await this.worklogBinderRepository.findOne({
      where: { id: +worklogId },
      relations: ['production'],
    });

    if (!worklog) {
      return null;
    }

    // pdMixerId를 pdMixerName으로 변환
    let pdMixerName: string | null = null;
    if (worklog.pdMixerId) {
      pdMixerName = await this.equipmentService.findNameById(worklog.pdMixerId);
    }

    // plant ID를 plant name으로 변환
    let plantName: string | null = null;
    if (worklog.plant) {
      plantName = await this.equipmentService.findNameById(worklog.plant);
    }

    const { production, pdMixerId, plant, ...rest } = worklog;
    return {
      ...rest,
      productionId: production?.name || '',
      pdMixerName,
      plant: plantName,
    };
  }

  async updateBinderWorklog(worklogId: string, updateBinderWorklogDto: UpdateBinderWorklogDto): Promise<WorklogBinder> {
    const worklog = await this.worklogBinderRepository.findOne({ where: { id: +worklogId } });

    if (!worklog) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }

    // 변경 전 actualInput 저장
    const previousMaterialData: { [key: string]: number } = {};
    for (let i = 1; i <= 2; i++) {
      previousMaterialData[`material${i}ActualInput`] = worklog[`material${i}ActualInput`] || 0;
    }

    // pdMixerName이 제공되면 pdMixerId로 변환
    if (updateBinderWorklogDto.pdMixerName) {
      const pdMixerId = await this.equipmentService.findIdByName(updateBinderWorklogDto.pdMixerName);
      worklog.pdMixerId = pdMixerId;
    }

    // pdMixerName을 제외한 나머지 필드 업데이트
    const updateData = { ...updateBinderWorklogDto };
    delete (updateData as any).pdMixerName;
    Object.assign(worklog, updateData);
    const savedWorklog = await this.worklogBinderRepository.save(worklog);

    // 자재 사용 이력 수정 - 사용량이 변경된 경우
    for (let i = 1; i <= 2; i++) {
      const materialName = updateBinderWorklogDto[`material${i}Name`];
      const materialLot = updateBinderWorklogDto[`material${i}Lot`];
      const newActualInput = updateBinderWorklogDto[`material${i}ActualInput`] || 0;
      const previousActualInput = previousMaterialData[`material${i}ActualInput`] || 0;

      // 사용량이 변경된 경우에만 이력 수정
      if (materialName && newActualInput !== previousActualInput) {
        await this.materialService.updateMaterialUsageHistory(
          materialName,
          materialLot,
          newActualInput,
          MaterialProcess.ELECTRODE,
        );
      }
    }

    return savedWorklog;
  }

  async deleteBinderWorklog(worklogId: string): Promise<void> {
    const worklog = await this.worklogBinderRepository.findOne({ where: { id: +worklogId } });

    if (!worklog) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }
    await this.worklogBinderRepository.remove(worklog);
  }

  /**
   * Binder 작업일지 LOT 목록 조회
   * - 해당 production의 LOT이 있는 작업일지만 조회
   * - 고형분(solidContent)은 solidContent1~3의 평균값
   */
  async getBinderLots(productionId: number): Promise<{ lotNumber: string; solidContent: number }[]> {
    const worklogs = await this.worklogBinderRepository
      .createQueryBuilder('worklog')
      .select(['worklog.lot', 'worklog.solidContent1', 'worklog.solidContent2', 'worklog.solidContent3'])
      .where('worklog.production_id = :productionId', { productionId })
      .andWhere('worklog.lot IS NOT NULL')
      .andWhere("worklog.lot != ''")
      .orderBy('worklog.createdAt', 'DESC')
      .getMany();

    return worklogs.map((w) => {
      const values = [w.solidContent1, w.solidContent2, w.solidContent3].filter((v) => v != null).map((v) => Number(v));
      const avgSolidContent = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;

      return {
        lotNumber: w.lot,
        solidContent: Math.round(avgSolidContent * 100) / 100,
      };
    });
  }
}
