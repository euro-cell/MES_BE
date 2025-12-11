import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorklogWelding } from 'src/common/entities/worklogs/worklog-10-welding.entity';
import { CreateWeldingWorklogDto, WeldingWorklogListResponseDto, UpdateWeldingWorklogDto } from 'src/common/dtos/worklog/10-welding.dto';

@Injectable()
export class WeldingService {
  constructor(
    @InjectRepository(WorklogWelding)
    private readonly worklogWeldingRepository: Repository<WorklogWelding>,
  ) {}

  async createWeldingWorklog(productionId: number, dto: CreateWeldingWorklogDto): Promise<WorklogWelding> {
    const worklog = this.worklogWeldingRepository.create({
      ...dto,
      production: { id: productionId },
    });
    return await this.worklogWeldingRepository.save(worklog);
  }

  async getWorklogs(productionId: number): Promise<WeldingWorklogListResponseDto[]> {
    const worklogs = await this.worklogWeldingRepository.find({
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

  async findWorklogById(worklogId: string): Promise<WorklogWelding | null> {
    return await this.worklogWeldingRepository.findOne({
      where: { id: +worklogId },
    });
  }

  async updateWeldingWorklog(worklogId: string, updateWeldingWorklogDto: UpdateWeldingWorklogDto): Promise<WorklogWelding> {
    const worklog = await this.worklogWeldingRepository.findOne({ where: { id: +worklogId } });

    if (!worklog) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }
    Object.assign(worklog, updateWeldingWorklogDto);

    return await this.worklogWeldingRepository.save(worklog);
  }

  async deleteWeldingWorklog(worklogId: string): Promise<void> {
    const worklog = await this.worklogWeldingRepository.findOne({ where: { id: +worklogId } });

    if (!worklog) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }
    await this.worklogWeldingRepository.remove(worklog);
  }
}
