import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductionPlan } from '../../../common/entities/production-plan.entity';
import { Production } from '../../../common/entities/production.entity';
import { Repository } from 'typeorm';
import { CreateProductionPlanDto, UpdateProductionPlanDto } from 'src/common/dtos/production-plan.dto';
import { PRODUCTION_PLAN_MAPPING } from 'src/common/types/production-plan.mapping';
import { PlanTransformerUtil } from 'src/common/utils/plan-transformer.util';

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

    const plans = await this.planRepository.find({
      where: { production: { id: productionId } },
      relations: ['production'],
      order: { startDate: 'ASC' },
    });
    return plans.map((plan) => PlanTransformerUtil.transformPlanData(plan));
  }

  async updatePlan(productionId: number, dto: UpdateProductionPlanDto) {
    const production = await this.ProductionRepository.findOne({
      where: { id: productionId },
    });
    if (!production) throw new NotFoundException('프로젝트를 찾을 수 없습니다.');

    const plan = await this.planRepository.findOne({
      where: { production: { id: productionId } },
    });

    if (!plan) throw new NotFoundException('등록된 생산계획이 없습니다.');

    const { startDate, endDate, processPlans } = dto;

    const updateData: Partial<Record<keyof ProductionPlan, any>> = {
      startDate,
      endDate,
    };

    for (const [key, value] of Object.entries(processPlans || {})) {
      const field = PRODUCTION_PLAN_MAPPING[key];
      if (!field) continue;

      const { start, end } = value;

      let dateValue = '';
      if (start && end) dateValue = `${start}~${end}`;
      else if (start) dateValue = start;
      else if (end) dateValue = end;
      else continue;

      updateData[field] = dateValue;
    }

    Object.assign(plan, updateData);

    return await this.planRepository.save(plan);
  }

  async deletePlan(projectId: number) {
    const plan = await this.planRepository.findOne({ where: { production: { id: projectId } } });
    if (!plan) {
      throw new NotFoundException('해당 생산에 등록된 계획이 없습니다.');
    }
    return await this.planRepository.delete(plan.id);
  }
}
