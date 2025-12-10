import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorklogPress } from 'src/common/entities/worklogs/worklog-04-press.entity';
import { CreatePressWorklogDto, PressWorklogListResponseDto, UpdatePressWorklogDto } from 'src/common/dtos/worklog/04-press.dto';

@Injectable()
export class PressService {
  constructor(
    @InjectRepository(WorklogPress)
    private readonly worklogPressRepository: Repository<WorklogPress>,
  ) {}

  async createPressWorklog(productionId: number, dto: CreatePressWorklogDto): Promise<WorklogPress> {
    const worklog = this.worklogPressRepository.create({
      ...dto,
      production: { id: productionId },
    });
    return await this.worklogPressRepository.save(worklog);
  }

  async getWorklogs(productionId: number): Promise<PressWorklogListResponseDto[]> {
    const worklogs = await this.worklogPressRepository.find({
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
    const worklog = await this.worklogPressRepository.findOne({
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

  async updatePressWorklog(worklogId: string, updatePressWorklogDto: UpdatePressWorklogDto): Promise<WorklogPress> {
    const worklog = await this.worklogPressRepository.findOne({ where: { id: +worklogId } });

    if (!worklog) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }
    Object.assign(worklog, updatePressWorklogDto);

    return await this.worklogPressRepository.save(worklog);
  }

  async deletePressWorklog(worklogId: string): Promise<void> {
    const worklog = await this.worklogPressRepository.findOne({ where: { id: +worklogId } });

    if (!worklog) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }
    await this.worklogPressRepository.remove(worklog);
  }
}
