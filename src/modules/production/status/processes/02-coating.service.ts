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

  async getMonthlyData(_productionId: number, _month: string, _type: 'cathode' | 'anode') {
    // TODO: 구현 예정
    const emptyData = {
      data: [],
      total: {
        totalOutput: 0,
        targetQuantity: null,
        progress: null,
      },
    };

    return {
      single: emptyData,
      double: emptyData,
    };
  }
}
