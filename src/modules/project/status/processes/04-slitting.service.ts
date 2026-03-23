import { Injectable } from '@nestjs/common';

@Injectable()
export class SlittingProcessService {
  async getMonthlyData(_productionId: number, _month: string, _type: 'cathode' | 'anode') {
    // TODO: WorklogSlitting 엔티티 생성 후 구현 예정
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
