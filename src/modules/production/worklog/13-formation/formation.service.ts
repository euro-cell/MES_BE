import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorklogFormation } from 'src/common/entities/worklogs/worklog-13-formation.entity';
import { CreateFormationWorklogDto, FormationWorklogListResponseDto, UpdateFormationWorklogDto } from 'src/common/dtos/worklog/13-formation.dto';

@Injectable()
export class FormationService {
  constructor(
    @InjectRepository(WorklogFormation)
    private readonly worklogFormationRepository: Repository<WorklogFormation>,
  ) {}

  async createFormationWorklog(productionId: number, dto: CreateFormationWorklogDto): Promise<WorklogFormation> {
    const worklog = this.worklogFormationRepository.create({
      ...dto,
      production: { id: productionId },
    });
    return await this.worklogFormationRepository.save(worklog);
  }

  async getWorklogs(productionId: number): Promise<FormationWorklogListResponseDto[]> {
    const worklogs = await this.worklogFormationRepository.find({
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

  async findWorklogById(worklogId: string): Promise<WorklogFormation | null> {
    return await this.worklogFormationRepository.findOne({
      where: { id: +worklogId },
    });
  }

  async updateFormationWorklog(worklogId: string, updateFormationWorklogDto: UpdateFormationWorklogDto): Promise<WorklogFormation> {
    const worklog = await this.worklogFormationRepository.findOne({ where: { id: +worklogId } });

    if (!worklog) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }
    Object.assign(worklog, updateFormationWorklogDto);

    return await this.worklogFormationRepository.save(worklog);
  }

  async deleteFormationWorklog(worklogId: string): Promise<void> {
    const worklog = await this.worklogFormationRepository.findOne({ where: { id: +worklogId } });

    if (!worklog) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }
    await this.worklogFormationRepository.remove(worklog);
  }
}
