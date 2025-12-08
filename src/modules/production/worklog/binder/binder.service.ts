import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorklogBinder } from 'src/common/entities/worklogs/worklog-binder.entity';
import { CreateBinderWorklogDto } from 'src/common/dtos/worklog/binder.dto';

@Injectable()
export class BinderService {
  constructor(
    @InjectRepository(WorklogBinder)
    private readonly worklogBinderRepository: Repository<WorklogBinder>,
  ) {}

  async createBinderWorklog(productionId: string, createBinderWorklogDto: CreateBinderWorklogDto): Promise<WorklogBinder> {
    const worklog = this.worklogBinderRepository.create({
      ...createBinderWorklogDto,
      productionId,
    });
    return await this.worklogBinderRepository.save(worklog);
  }
}
