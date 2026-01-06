import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorklogBinder } from 'src/common/entities/worklogs/worklog-01-binder.entity';
import { CreateBinderWorklogDto, BinderWorklogListResponseDto, UpdateBinderWorklogDto } from 'src/common/dtos/worklog/01-binder.dto';
import { MaterialService } from 'src/modules/material/material.service';
import { MaterialProcess } from 'src/common/enums/material.enum';

@Injectable()
export class BinderService {
  constructor(
    @InjectRepository(WorklogBinder)
    private readonly worklogBinderRepository: Repository<WorklogBinder>,
    private readonly materialService: MaterialService,
  ) {}

  async createBinderWorklog(productionId: number, dto: CreateBinderWorklogDto): Promise<WorklogBinder> {
    const worklog = this.worklogBinderRepository.create({
      ...dto,
      production: { id: productionId },
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

    const { production, ...rest } = worklog;
    return {
      ...rest,
      productionId: production?.name || '',
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

    Object.assign(worklog, updateBinderWorklogDto);
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
}
