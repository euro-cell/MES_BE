import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorklogPress } from 'src/common/entities/worklogs/worklog-04-press.entity';

@Injectable()
export class PressProcessService {
  constructor(
    @InjectRepository(WorklogPress)
    private readonly pressRepository: Repository<WorklogPress>,
  ) {}
}
