import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorklogSealing } from 'src/common/entities/worklogs/worklog-11-sealing.entity';
import { CreateSealingWorklogDto, SealingWorklogListResponseDto, UpdateSealingWorklogDto } from 'src/common/dtos/worklog/11-sealing.dto';

@Injectable()
export class SealingService {
  constructor(
    @InjectRepository(WorklogSealing)
    private readonly worklogSealingRepository: Repository<WorklogSealing>,
  ) {}

  async createSealingWorklog(productionId: number, dto: CreateSealingWorklogDto): Promise<WorklogSealing> {
    const worklog = this.worklogSealingRepository.create({
      ...dto,
      production: { id: productionId },
    });
    return await this.worklogSealingRepository.save(worklog);
  }

  async getWorklogs(productionId: number): Promise<SealingWorklogListResponseDto[]> {
    const worklogs = await this.worklogSealingRepository.find({
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

  async findWorklogById(worklogId: string): Promise<WorklogSealing | null> {
    return await this.worklogSealingRepository.findOne({
      where: { id: +worklogId },
    });
  }

  async updateSealingWorklog(worklogId: string, updateSealingWorklogDto: UpdateSealingWorklogDto): Promise<WorklogSealing> {
    const worklog = await this.worklogSealingRepository.findOne({ where: { id: +worklogId } });

    if (!worklog) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }
    Object.assign(worklog, updateSealingWorklogDto);

    return await this.worklogSealingRepository.save(worklog);
  }

  async deleteSealingWorklog(worklogId: string): Promise<void> {
    const worklog = await this.worklogSealingRepository.findOne({ where: { id: +worklogId } });

    if (!worklog) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }
    await this.worklogSealingRepository.remove(worklog);
  }
}
