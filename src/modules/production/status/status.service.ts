import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductionPlan } from 'src/common/entities/production-plan.entity';
import { Repository } from 'typeorm';
import { MixingProcessService } from './processes';
import { ProductionTargetDto } from 'src/common/dtos/production-target.dto';
import { ProductionTarget } from 'src/common/entities/production-target.entity';

@Injectable()
export class StatusService {
  constructor(
    @InjectRepository(ProductionPlan)
    private readonly productionPlanRepository: Repository<ProductionPlan>,
    @InjectRepository(ProductionTarget)
    private readonly productionTargetRepository: Repository<ProductionTarget>,
    private readonly mixingProcessService: MixingProcessService,
  ) {}

  async targetStatus(productionId: number, dto: ProductionTargetDto) {
    const existingTarget = await this.productionTargetRepository.findOne({
      where: { production: { id: productionId } },
    });
    let target: ProductionTarget;

    if (existingTarget) {
      Object.keys(dto).forEach((key) => {
        if (dto[key] !== undefined && dto[key] !== null) {
          existingTarget[key] = dto[key];
        }
      });
      target = await this.productionTargetRepository.save(existingTarget);
    } else {
      const newTarget = this.productionTargetRepository.create({
        production: { id: productionId },
        ...dto,
      });
      target = await this.productionTargetRepository.save(newTarget);
    }
    return target;
  }

  async getStatusData(productionId: number) {
    const productionPlan = await this.productionPlanRepository.findOne({
      where: { production: { id: productionId } },
      relations: ['production'],
    });

    if (!productionPlan) {
      return { name: null, startDate: null, endDate: null };
    }

    return {
      name: productionPlan.production.name,
      startDate: productionPlan.startDate,
      endDate: productionPlan.endDate,
    };
  }

  async getElectrodeStatus(productionId: number, month: string, type: 'cathode' | 'anode') {
    const mixing = await this.mixingProcessService.getMonthlyData(productionId, month, type);
    return mixing;
  }
}
