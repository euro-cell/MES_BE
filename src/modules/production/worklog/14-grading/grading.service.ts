import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorklogGrading } from 'src/common/entities/worklogs/worklog-14-grading.entity';
import { CreateGradingWorklogDto, GradingWorklogListResponseDto, UpdateGradingWorklogDto } from 'src/common/dtos/worklog/14-grading.dto';

@Injectable()
export class GradingService {
  constructor(
    @InjectRepository(WorklogGrading)
    private readonly worklogGradingRepository: Repository<WorklogGrading>,
  ) {}

  async createGradingWorklog(productionId: number, dto: CreateGradingWorklogDto): Promise<WorklogGrading> {
    const worklog = this.worklogGradingRepository.create({
      ...dto,
      production: { id: productionId },
    });
    return await this.worklogGradingRepository.save(worklog);
  }

  async getWorklogs(productionId: number): Promise<GradingWorklogListResponseDto[]> {
    const worklogs = await this.worklogGradingRepository.find({
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

  async findWorklogById(worklogId: string): Promise<WorklogGrading | null> {
    return await this.worklogGradingRepository.findOne({
      where: { id: +worklogId },
    });
  }

  async updateGradingWorklog(worklogId: string, updateGradingWorklogDto: UpdateGradingWorklogDto): Promise<WorklogGrading> {
    const worklog = await this.worklogGradingRepository.findOne({ where: { id: +worklogId } });

    if (!worklog) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }
    Object.assign(worklog, updateGradingWorklogDto);

    return await this.worklogGradingRepository.save(worklog);
  }

  async deleteGradingWorklog(worklogId: string): Promise<void> {
    const worklog = await this.worklogGradingRepository.findOne({ where: { id: +worklogId } });

    if (!worklog) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }
    await this.worklogGradingRepository.remove(worklog);
  }
}
