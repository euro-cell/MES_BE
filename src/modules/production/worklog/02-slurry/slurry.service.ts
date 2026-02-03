import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorklogSlurry } from 'src/common/entities/worklogs/worklog-02-slurry.entity';
import { CreateSlurryWorklogDto, SlurryWorklogListResponseDto, UpdateSlurryWorklogDto } from 'src/common/dtos/worklog/02-slurry.dto';
import { MaterialService } from 'src/modules/material/material.service';
import { EquipmentService } from 'src/modules/equipment/equipment.service';
import { MaterialProcess } from 'src/common/enums/material.enum';

@Injectable()
export class SlurryService {
  constructor(
    @InjectRepository(WorklogSlurry)
    private readonly worklogSlurryRepository: Repository<WorklogSlurry>,
    private readonly materialService: MaterialService,
    private readonly equipmentService: EquipmentService,
  ) {}

  async createSlurryWorklog(productionId: number, createSlurryWorklogDto: CreateSlurryWorklogDto): Promise<WorklogSlurry> {
    const worklog = this.worklogSlurryRepository.create({
      ...createSlurryWorklogDto,
      production: { id: productionId },
    });
    const savedWorklog = await this.worklogSlurryRepository.save(worklog);

    // 자재 사용 이력 기록 (material1~8)
    for (let i = 1; i <= 8; i++) {
      const materialName = createSlurryWorklogDto[`material${i}Name`];
      const materialLot = createSlurryWorklogDto[`material${i}Lot`];
      const actualInput = createSlurryWorklogDto[`material${i}ActualInput`];

      if (materialName && actualInput && actualInput > 0) {
        await this.materialService.recordMaterialUsage(materialName, materialLot, actualInput, MaterialProcess.ELECTRODE);
      }
    }

    return savedWorklog;
  }

  async getWorklogs(productionId: number): Promise<SlurryWorklogListResponseDto[]> {
    const worklogs = await this.worklogSlurryRepository.find({
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
    const worklog = await this.worklogSlurryRepository.findOne({
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

  async updateSlurryWorklog(worklogId: string, updateSlurryWorklogDto: UpdateSlurryWorklogDto): Promise<WorklogSlurry> {
    const worklog = await this.worklogSlurryRepository.findOne({ where: { id: +worklogId } });

    if (!worklog) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }

    // 변경 전 actualInput 저장
    const previousMaterialData: { [key: string]: number } = {};
    for (let i = 1; i <= 8; i++) {
      previousMaterialData[`material${i}ActualInput`] = worklog[`material${i}ActualInput`] || 0;
    }

    Object.assign(worklog, updateSlurryWorklogDto);
    const savedWorklog = await this.worklogSlurryRepository.save(worklog);

    // 자재 사용 이력 수정 - 사용량이 변경된 경우
    for (let i = 1; i <= 8; i++) {
      const materialName = updateSlurryWorklogDto[`material${i}Name`];
      const materialLot = updateSlurryWorklogDto[`material${i}Lot`];
      const newActualInput = updateSlurryWorklogDto[`material${i}ActualInput`] || 0;
      const previousActualInput = previousMaterialData[`material${i}ActualInput`] || 0;

      // 사용량이 변경된 경우에만 이력 수정
      if (materialName && newActualInput !== previousActualInput) {
        await this.materialService.updateMaterialUsageHistory(materialName, materialLot, newActualInput, MaterialProcess.ELECTRODE);
      }
    }

    return savedWorklog;
  }

  async deleteSlurryWorklog(worklogId: string): Promise<void> {
    const worklog = await this.worklogSlurryRepository.findOne({ where: { id: +worklogId } });

    if (!worklog) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }

    await this.worklogSlurryRepository.remove(worklog);
  }

  async getLots(productionId: number) {
    const worklogs = await this.worklogSlurryRepository.find({
      where: { production: { id: productionId } },
      select: ['lot', 'solidContent', 'viscosityAfterStabilization'],
      order: { createdAt: 'ASC' },
    });

    return worklogs
      .filter((w) => w.lot)
      .map((w) => ({
        lotNumber: w.lot,
        solidContent: w.solidContent ? Number(w.solidContent) : null,
        viscosity: w.viscosityAfterStabilization ? Number(w.viscosityAfterStabilization) : null,
      }));
  }

  /**
   * Binder 작업일지에서 사용할 Slurry 믹싱 정보 조회
   * - LOT이 존재하는 Slurry 작업일지만 조회
   * - material1~6 중 Name이 '바인더'인 행의 PlannedInput 값 반환
   */
  async getMixingInfoForBinder(productionId: number) {
    const worklogs = await this.worklogSlurryRepository.find({
      where: { production: { id: productionId } },
      order: { manufactureDate: 'DESC', createdAt: 'DESC' },
    });

    // 회차 계산을 위한 맵 (날짜별로 역순 카운트)
    const dateWorklogsMap = new Map<string, typeof worklogs>();
    for (const worklog of worklogs) {
      const dateKey = worklog.manufactureDate.toString();
      if (!dateWorklogsMap.has(dateKey)) {
        dateWorklogsMap.set(dateKey, []);
      }
      dateWorklogsMap.get(dateKey)!.push(worklog);
    }

    return worklogs.map((worklog) => {
      const dateKey = worklog.manufactureDate.toString();
      const dateWorklogs = dateWorklogsMap.get(dateKey)!;
      // 해당 날짜의 작업일지들 중에서 현재 작업일지의 순서 (createdAt 기준 오름차순)
      const sortedByCreatedAt = [...dateWorklogs].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      const round = sortedByCreatedAt.findIndex((w) => w.id === worklog.id) + 1;

      // material1~6 중 Name이 '바인더'인 행의 PlannedInput 값 찾기
      let binderPlannedInput: number | null = null;
      for (let i = 1; i <= 6; i++) {
        const materialName = worklog[`material${i}Name` as keyof typeof worklog] as string | null;
        if (materialName && materialName.includes('바인더')) {
          binderPlannedInput = worklog[`material${i}PlannedInput` as keyof typeof worklog] as number | null;
          break;
        }
      }

      return {
        id: worklog.id,
        lot: worklog.lot,
        workDate: worklog.manufactureDate.toString(),
        round,
        binderPlannedInput: binderPlannedInput ? Number(binderPlannedInput) : null,
      };
    });
  }
}
