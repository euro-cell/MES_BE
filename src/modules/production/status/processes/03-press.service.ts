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

  async getMonthlyData(_productionId: number, _month: string, _type: 'cathode' | 'anode') {
    // TODO: 구현 예정
    return {
      data: [],
      total: {
        totalOutput: 0,
        targetQuantity: null,
        progress: null,
      },
    };
  }
}
