import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PlanService } from './plan.service';
import { CreateProductionPlanDto } from 'src/common/dtos/production-plan.dto';

@Controller(':projectId/plan')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Post()
  async saveProjectPlan(@Param('projectId') productionId: number, @Body() dto: CreateProductionPlanDto) {
    return this.planService.savePlan(productionId, dto);
  }

  @Get()
  async searchPlans(@Param('projectId') productionId: number) {
    return this.planService.searchPlans({ productionId });
  }
}
