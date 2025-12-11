import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorklogNotching } from 'src/common/entities/worklogs/worklog-06-notching.entity';
import { CreateNotchingWorklogDto, NotchingWorklogListResponseDto, UpdateNotchingWorklogDto } from 'src/common/dtos/worklog/06-notching.dto';

@Injectable()
export class NotchingService {
  constructor(
    @InjectRepository(WorklogNotching)
    private readonly worklogNotchingRepository: Repository<WorklogNotching>,
  ) {}

  async createNotchingWorklog(productionId: number, dto: CreateNotchingWorklogDto): Promise<WorklogNotching> {
    const worklog = this.worklogNotchingRepository.create({
      ...dto,
      production: { id: productionId },
    });
    return await this.worklogNotchingRepository.save(worklog);
  }

  async getWorklogs(productionId: number): Promise<NotchingWorklogListResponseDto[]> {
    const worklogs = await this.worklogNotchingRepository.find({
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
    const worklog = await this.worklogNotchingRepository.findOne({
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

  async updateNotchingWorklog(worklogId: string, updateNotchingWorklogDto: UpdateNotchingWorklogDto): Promise<WorklogNotching> {
    const worklog = await this.worklogNotchingRepository.findOne({ where: { id: +worklogId } });

    if (!worklog) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }
    Object.assign(worklog, updateNotchingWorklogDto);

    return await this.worklogNotchingRepository.save(worklog);
  }

  async deleteNotchingWorklog(worklogId: string): Promise<void> {
    const worklog = await this.worklogNotchingRepository.findOne({ where: { id: +worklogId } });

    if (!worklog) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }
    await this.worklogNotchingRepository.remove(worklog);
  }
}
