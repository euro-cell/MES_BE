import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorklogCoating } from 'src/common/entities/worklogs/worklog-03-coating.entity';
import { CreateCoatingWorklogDto, CoatingWorklogListResponseDto, UpdateCoatingWorklogDto } from 'src/common/dtos/worklog/03-coating.dto';

@Injectable()
export class CoatingService {
  constructor(
    @InjectRepository(WorklogCoating)
    private readonly worklogCoatingRepository: Repository<WorklogCoating>,
  ) {}

  async createCoatingWorklog(productionId: number, dto: CreateCoatingWorklogDto): Promise<WorklogCoating> {
    const worklog = this.worklogCoatingRepository.create({
      ...dto,
      production: { id: productionId },
    });
    return await this.worklogCoatingRepository.save(worklog);
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
    Object.assign(worklog, updateCoatingWorklogDto);

    return await this.worklogCoatingRepository.save(worklog);
  }

  async deleteCoatingWorklog(worklogId: string): Promise<void> {
    const worklog = await this.worklogCoatingRepository.findOne({ where: { id: +worklogId } });

    if (!worklog) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }
    await this.worklogCoatingRepository.remove(worklog);
  }
}
