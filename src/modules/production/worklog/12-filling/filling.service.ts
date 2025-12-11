import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorklogFilling } from 'src/common/entities/worklogs/worklog-12-filling.entity';
import { CreateFillingWorklogDto, FillingWorklogListResponseDto, UpdateFillingWorklogDto } from 'src/common/dtos/worklog/12-filling.dto';

@Injectable()
export class FillingService {
  constructor(
    @InjectRepository(WorklogFilling)
    private readonly worklogFillingRepository: Repository<WorklogFilling>,
  ) {}

  async createFillingWorklog(productionId: number, dto: CreateFillingWorklogDto): Promise<WorklogFilling> {
    const worklog = this.worklogFillingRepository.create({
      ...dto,
      production: { id: productionId },
    });
    return await this.worklogFillingRepository.save(worklog);
  }

  async getWorklogs(productionId: number): Promise<FillingWorklogListResponseDto[]> {
    const worklogs = await this.worklogFillingRepository.find({
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

  async findWorklogById(worklogId: string): Promise<WorklogFilling | null> {
    return await this.worklogFillingRepository.findOne({
      where: { id: +worklogId },
    });
  }

  async updateFillingWorklog(worklogId: string, updateFillingWorklogDto: UpdateFillingWorklogDto): Promise<WorklogFilling> {
    const worklog = await this.worklogFillingRepository.findOne({ where: { id: +worklogId } });

    if (!worklog) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }
    Object.assign(worklog, updateFillingWorklogDto);

    return await this.worklogFillingRepository.save(worklog);
  }

  async deleteFillingWorklog(worklogId: string): Promise<void> {
    const worklog = await this.worklogFillingRepository.findOne({ where: { id: +worklogId } });

    if (!worklog) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }
    await this.worklogFillingRepository.remove(worklog);
  }
}
