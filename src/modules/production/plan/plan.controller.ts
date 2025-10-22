import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PlanService } from './plan.service';

@Controller(':projectId/plan')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Post()
  async saveProjectPlan(@Param('projectId') productionId: number, @Body() body: Record<string, any>) {
    return this.planService.savePlan(productionId, body);
  }

  @Get()
  async searchPlans(@Param('projectId') productionId: number) {
    return this.planService.searchPlans({ productionId });
  }
}
