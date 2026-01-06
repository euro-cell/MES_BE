import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorklogCoating } from 'src/common/entities/worklogs/worklog-03-coating.entity';
import { CreateCoatingWorklogDto, CoatingWorklogListResponseDto, UpdateCoatingWorklogDto } from 'src/common/dtos/worklog/03-coating.dto';
import { MaterialService } from 'src/modules/material/material.service';
import { MaterialProcess } from 'src/common/enums/material.enum';

@Injectable()
export class CoatingService {
  constructor(
    @InjectRepository(WorklogCoating)
    private readonly worklogCoatingRepository: Repository<WorklogCoating>,
    private readonly materialService: MaterialService,
  ) {}

  async createCoatingWorklog(productionId: number, dto: CreateCoatingWorklogDto): Promise<WorklogCoating> {
    const worklog = this.worklogCoatingRepository.create({
      ...dto,
      production: { id: productionId },
    });
    const savedWorklog = await this.worklogCoatingRepository.save(worklog);

    // 자재 사용 이력 기록 (material1, material2)
    // material1: materialType, materialLot, usageAmount
    if (dto.materialType && dto.usageAmount && dto.usageAmount > 0) {
      await this.materialService.recordMaterialUsage(dto.materialType, dto.materialLot, dto.usageAmount, MaterialProcess.ELECTRODE);
    }

    // material2: materialType2, materialLot2, inputAmountActual
    if (dto.materialType2 && dto.inputAmountActual && dto.inputAmountActual > 0) {
      await this.materialService.recordMaterialUsage(dto.materialType2, dto.materialLot2, dto.inputAmountActual, MaterialProcess.ELECTRODE);
    }

    return savedWorklog;
  }

  async getWorklogs(productionId: number): Promise<CoatingWorklogListResponseDto[]> {
    const worklogs = await this.worklogCoatingRepository.find({
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

  async findWorklogById(worklogId: string): Promise<WorklogCoating | null> {
    return await this.worklogCoatingRepository.findOne({
      where: { id: +worklogId },
    });
  }

  async updateCoatingWorklog(worklogId: string, updateCoatingWorklogDto: UpdateCoatingWorklogDto): Promise<WorklogCoating> {
    const worklog = await this.worklogCoatingRepository.findOne({ where: { id: +worklogId } });

    if (!worklog) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }

    // 변경 전 usageAmount 저장
    const previousUsageAmount = worklog.usageAmount || 0;
    const previousInputAmountActual = worklog.inputAmountActual || 0;

    Object.assign(worklog, updateCoatingWorklogDto);
    const savedWorklog = await this.worklogCoatingRepository.save(worklog);

    // 자재 사용 이력 수정 - 사용량이 변경된 경우
    const newUsageAmount = updateCoatingWorklogDto.usageAmount || 0;
    if (updateCoatingWorklogDto.materialType && newUsageAmount !== previousUsageAmount) {
      await this.materialService.updateMaterialUsageHistory(
        updateCoatingWorklogDto.materialType,
        updateCoatingWorklogDto.materialLot,
        newUsageAmount,
        MaterialProcess.ELECTRODE,
      );
    }

    const newInputAmountActual = updateCoatingWorklogDto.inputAmountActual || 0;
    if (updateCoatingWorklogDto.materialType2 && newInputAmountActual !== previousInputAmountActual) {
      await this.materialService.updateMaterialUsageHistory(
        updateCoatingWorklogDto.materialType2,
        updateCoatingWorklogDto.materialLot2,
        newInputAmountActual,
        MaterialProcess.ELECTRODE,
      );
    }

    return savedWorklog;
  }

  async deleteCoatingWorklog(worklogId: string): Promise<void> {
    const worklog = await this.worklogCoatingRepository.findOne({ where: { id: +worklogId } });

    if (!worklog) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }
    await this.worklogCoatingRepository.remove(worklog);
  }
}
