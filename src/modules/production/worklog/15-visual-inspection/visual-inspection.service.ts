import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorklogVisualInspection } from 'src/common/entities/worklogs/worklog-15-visual-inspection.entity';
import {
  CreateVisualInspectionWorklogDto,
  VisualInspectionWorklogListResponseDto,
  UpdateVisualInspectionWorklogDto,
} from 'src/common/dtos/worklog/15-visual-inspection.dto';

@Injectable()
export class VisualInspectionService {
  constructor(
    @InjectRepository(WorklogVisualInspection)
    private readonly worklogVisualInspectionRepository: Repository<WorklogVisualInspection>,
  ) {}

  async createVisualInspectionWorklog(productionId: number, dto: CreateVisualInspectionWorklogDto): Promise<WorklogVisualInspection> {
    const worklog = this.worklogVisualInspectionRepository.create({
      ...dto,
      production: { id: productionId },
    });
    return await this.worklogVisualInspectionRepository.save(worklog);
  }

  async getWorklogs(productionId: number): Promise<VisualInspectionWorklogListResponseDto[]> {
    const worklogs = await this.worklogVisualInspectionRepository.find({
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

  async findWorklogById(worklogId: string): Promise<WorklogVisualInspection | null> {
    return await this.worklogVisualInspectionRepository.findOne({
      where: { id: +worklogId },
    });
  }

  async updateVisualInspectionWorklog(
    worklogId: string,
    updateVisualInspectionWorklogDto: UpdateVisualInspectionWorklogDto,
  ): Promise<WorklogVisualInspection> {
    const worklog = await this.worklogVisualInspectionRepository.findOne({ where: { id: +worklogId } });

    if (!worklog) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }
    Object.assign(worklog, updateVisualInspectionWorklogDto);

    return await this.worklogVisualInspectionRepository.save(worklog);
  }

  async deleteVisualInspectionWorklog(worklogId: string): Promise<void> {
    const worklog = await this.worklogVisualInspectionRepository.findOne({ where: { id: +worklogId } });

    if (!worklog) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }
    await this.worklogVisualInspectionRepository.remove(worklog);
  }
}
