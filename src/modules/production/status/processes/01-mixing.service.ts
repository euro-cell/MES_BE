import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorklogSlurry } from 'src/common/entities/worklogs/worklog-02-slurry.entity';

@Injectable()
export class MixingProcessService {
  constructor(
    @InjectRepository(WorklogSlurry)
    private readonly slurryRepository: Repository<WorklogSlurry>,
  ) {}
}
