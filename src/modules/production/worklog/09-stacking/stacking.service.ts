import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorklogStacking } from 'src/common/entities/worklogs/worklog-09-stacking.entity';
import {
  CreateStackingWorklogDto,
  StackingWorklogListResponseDto,
  UpdateStackingWorklogDto,
} from 'src/common/dtos/worklog/09-stacking.dto';

@Injectable()
export class StackingService {
  constructor(
    @InjectRepository(WorklogStacking)
    private readonly worklogStackingRepository: Repository<WorklogStacking>,
  ) {}

  async createStackingWorklog(productionId: number, dto: CreateStackingWorklogDto): Promise<WorklogStacking> {
    const worklog = this.worklogStackingRepository.create({
      ...dto,
      production: { id: productionId },
    });
    return await this.worklogStackingRepository.save(worklog);
  }

  async getWorklogs(productionId: number): Promise<StackingWorklogListResponseDto[]> {
    const worklogs = await this.worklogStackingRepository.find({
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

  async findWorklogById(worklogId: string): Promise<WorklogStacking | null> {
    return await this.worklogStackingRepository.findOne({
      where: { id: +worklogId },
    });
  }

  async updateStackingWorklog(worklogId: string, updateStackingWorklogDto: UpdateStackingWorklogDto): Promise<WorklogStacking> {
    const worklog = await this.worklogStackingRepository.findOne({ where: { id: +worklogId } });

    if (!worklog) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }
    Object.assign(worklog, updateStackingWorklogDto);

    return await this.worklogStackingRepository.save(worklog);
  }

  async deleteStackingWorklog(worklogId: string): Promise<void> {
    const worklog = await this.worklogStackingRepository.findOne({ where: { id: +worklogId } });

    if (!worklog) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }
    await this.worklogStackingRepository.remove(worklog);
  }
}
