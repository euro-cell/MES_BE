import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorklogSlurry } from 'src/common/entities/worklogs/worklog-02-slurry.entity';
import { CreateSlurryWorklogDto, SlurryWorklogListResponseDto, UpdateSlurryWorklogDto } from 'src/common/dtos/worklog/02-slurry.dto';

@Injectable()
export class SlurryService {
  constructor(
    @InjectRepository(WorklogSlurry)
    private readonly worklogSlurryRepository: Repository<WorklogSlurry>,
  ) {}

  async createSlurryWorklog(productionId: number, createSlurryWorklogDto: CreateSlurryWorklogDto): Promise<WorklogSlurry> {
    const worklog = this.worklogSlurryRepository.create({
      ...createSlurryWorklogDto,
      production: { id: productionId },
    });
    return await this.worklogSlurryRepository.save(worklog);
  }

  async getWorklogs(productionId: number): Promise<SlurryWorklogListResponseDto[]> {
    const worklogs = await this.worklogSlurryRepository.find({
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
    const worklog = await this.worklogSlurryRepository.findOne({
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

  async updateSlurryWorklog(worklogId: string, updateSlurryWorklogDto: UpdateSlurryWorklogDto): Promise<WorklogSlurry> {
    const worklog = await this.worklogSlurryRepository.findOne({ where: { id: +worklogId } });

    if (!worklog) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }
    Object.assign(worklog, updateSlurryWorklogDto);

    return await this.worklogSlurryRepository.save(worklog);
  }

  async deleteSlurryWorklog(worklogId: string): Promise<void> {
    const worklog = await this.worklogSlurryRepository.findOne({ where: { id: +worklogId } });

    if (!worklog) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }

    await this.worklogSlurryRepository.remove(worklog);
  }
}
