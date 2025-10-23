import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductionPlan } from '../../../common/entities/production-plan.entity';
import { Production } from '../../../common/entities/production.entity';
import { Repository } from 'typeorm';
import { CreateProductionPlanDto } from 'src/common/dtos/production-plan.dto';
import { PRODUCTION_PLAN_MAPPING } from 'src/common/types/production-plan.mapping';

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(ProductionPlan)
    private readonly planRepository: Repository<ProductionPlan>,
    @InjectRepository(Production)
    private readonly ProductionRepository: Repository<Production>,
  ) {}

  async savePlan(productionId: number, dto: CreateProductionPlanDto) {
    const production = await this.ProductionRepository.findOne({
      where: { id: productionId },
    });
    if (!production) throw new NotFoundException('프로젝트를 찾을 수 없습니다.');

    const { startDate, endDate, processPlans } = dto;

    const planData: Partial<Record<keyof ProductionPlan, any>> = {
      production,
      startDate,
      endDate,
    };

    for (const [key, value] of Object.entries(processPlans)) {
      const field = PRODUCTION_PLAN_MAPPING[key];
      if (!field) {
        console.warn(`⚠️ 매칭되지 않은 공정명: ${key}`);
        continue;
      }
      const { start, end } = value;

      let dateValue = '';
      if (start && end) dateValue = `${start}~${end}`;
      else if (start) dateValue = start;
      else if (end) dateValue = end;
      else continue;

      planData[field] = dateValue;
    }

    let plan = await this.planRepository.findOne({
      where: { production: { id: productionId } },
    });

    if (plan) {
      Object.assign(plan, planData);
    } else {
      plan = this.planRepository.create(planData);
    }
    return await this.planRepository.save(plan);
  }

  async searchPlans(filters: { productionId?: number }) {
    const { productionId } = filters;
    if (!productionId) return [];

    return this.planRepository.find({
      where: { production: { id: productionId } },
      relations: ['production'],
      order: { startDate: 'ASC' },
    });
  }
}
