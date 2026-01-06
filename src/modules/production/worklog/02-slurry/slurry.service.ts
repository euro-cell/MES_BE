import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorklogSlurry } from 'src/common/entities/worklogs/worklog-02-slurry.entity';
import { CreateSlurryWorklogDto, SlurryWorklogListResponseDto, UpdateSlurryWorklogDto } from 'src/common/dtos/worklog/02-slurry.dto';
import { MaterialService } from 'src/modules/material/material.service';
import { MaterialProcess } from 'src/common/enums/material.enum';

@Injectable()
export class SlurryService {
  constructor(
    @InjectRepository(WorklogSlurry)
    private readonly worklogSlurryRepository: Repository<WorklogSlurry>,
    private readonly materialService: MaterialService,
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

    const { production, ...rest } = worklog;
    return {
      ...rest,
      productionId: production?.name || '',
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

  async deleteSlurryWorklog(worklogId: string): Promise<void> {
    const worklog = await this.worklogSlurryRepository.findOne({ where: { id: +worklogId } });

    if (!worklog) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }

    await this.worklogSlurryRepository.remove(worklog);
  }
}
