import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorklogForming } from 'src/common/entities/worklogs/worklog-08-forming.entity';
import { CreateFormingWorklogDto, FormingWorklogListResponseDto, UpdateFormingWorklogDto } from 'src/common/dtos/worklog/08-forming.dto';

@Injectable()
export class FormingService {
  constructor(
    @InjectRepository(WorklogForming)
    private readonly worklogFormingRepository: Repository<WorklogForming>,
  ) {}

  async createFormingWorklog(productionId: number, dto: CreateFormingWorklogDto): Promise<WorklogForming> {
    const worklog = this.worklogFormingRepository.create({
      ...dto,
      production: { id: productionId },
    });
    return await this.worklogFormingRepository.save(worklog);
  }

  async getWorklogs(productionId: number): Promise<FormingWorklogListResponseDto[]> {
    const worklogs = await this.worklogFormingRepository.find({
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

  async findWorklogById(worklogId: string): Promise<WorklogForming | null> {
    return await this.worklogFormingRepository.findOne({
      where: { id: +worklogId },
    });
  }

  async updateFormingWorklog(worklogId: string, updateFormingWorklogDto: UpdateFormingWorklogDto): Promise<WorklogForming> {
    const worklog = await this.worklogFormingRepository.findOne({ where: { id: +worklogId } });

    if (!worklog) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }
    Object.assign(worklog, updateFormingWorklogDto);

    return await this.worklogFormingRepository.save(worklog);
  }

  async deleteFormingWorklog(worklogId: string): Promise<void> {
    const worklog = await this.worklogFormingRepository.findOne({ where: { id: +worklogId } });

    if (!worklog) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }
    await this.worklogFormingRepository.remove(worklog);
  }
}
