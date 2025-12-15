import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorklogNotching } from 'src/common/entities/worklogs/worklog-06-notching.entity';

@Injectable()
export class NotchingProcessService {
  constructor(
    @InjectRepository(WorklogNotching)
    private readonly notchingRepository: Repository<WorklogNotching>,
  ) {}
}
