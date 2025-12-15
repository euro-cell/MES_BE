import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorklogCoating } from 'src/common/entities/worklogs/worklog-03-coating.entity';

@Injectable()
export class CoatingProcessService {
  constructor(
    @InjectRepository(WorklogCoating)
    private readonly coatingRepository: Repository<WorklogCoating>,
  ) {}
}
