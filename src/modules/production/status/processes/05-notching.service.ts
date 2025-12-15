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
