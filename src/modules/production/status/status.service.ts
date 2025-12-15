import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductionPlan } from 'src/common/entities/production-plan.entity';
import { Repository } from 'typeorm';
import { MixingProcessService } from './processes';

@Injectable()
export class StatusService {
  constructor(
    @InjectRepository(ProductionPlan)
    private readonly productionPlanRepository: Repository<ProductionPlan>,

    private readonly mixingProcessService: MixingProcessService,
  ) {}

  async getStatusData(productionId: number) {
    const productionPlan = await this.productionPlanRepository.findOne({ where: { production: { id: productionId } } });
    if (!productionPlan) return { startDate: null, endDate: null };
    return { startDate: productionPlan.startDate, endDate: productionPlan.endDate };
  }

  async getElectrodeStatus(productionId: number, month: string, type: 'cathode' | 'anode') {
    const mixing = await this.mixingProcessService.getMonthlyData(productionId, month, type);
    return mixing;
  }
}
