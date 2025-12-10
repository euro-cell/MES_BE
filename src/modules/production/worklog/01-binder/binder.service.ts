import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorklogBinder } from 'src/common/entities/worklogs/worklog-01-binder.entity';
import { CreateBinderWorklogDto, BinderWorklogListResponseDto, UpdateBinderWorklogDto } from 'src/common/dtos/worklog/01-binder.dto';

@Injectable()
export class BinderService {
  constructor(
    @InjectRepository(WorklogBinder)
    private readonly worklogBinderRepository: Repository<WorklogBinder>,
  ) {}

  async createBinderWorklog(productionId: number, dto: CreateBinderWorklogDto): Promise<WorklogBinder> {
    const worklog = this.worklogBinderRepository.create({
      ...dto,
      production: { id: productionId },
    });
    return await this.worklogBinderRepository.save(worklog);
  }

  async getWorklogs(productionId: number): Promise<BinderWorklogListResponseDto[]> {
    const worklogs = await this.worklogBinderRepository.find({
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
    const worklog = await this.worklogBinderRepository.findOne({
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

  async updateBinderWorklog(worklogId: string, updateBinderWorklogDto: UpdateBinderWorklogDto): Promise<WorklogBinder> {
    const worklog = await this.worklogBinderRepository.findOne({ where: { id: +worklogId } });

    if (!worklog) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }
    Object.assign(worklog, updateBinderWorklogDto);

    return await this.worklogBinderRepository.save(worklog);
  }

  async deleteBinderWorklog(worklogId: string): Promise<void> {
    const worklog = await this.worklogBinderRepository.findOne({ where: { id: +worklogId } });

    if (!worklog) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }
    await this.worklogBinderRepository.remove(worklog);
  }
}
