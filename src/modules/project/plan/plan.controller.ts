import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { PlanService } from './plan.service';
import { CreateProductionPlanDto, UpdateProductionPlanDto } from 'src/common/dtos/production-plan.dto';

@Controller(':productionId/plan')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Post()
  async saveProjectPlan(@Param('productionId') productionId: number, @Body() dto: CreateProductionPlanDto) {
    return this.planService.savePlan(productionId, dto);
  }

  @Get()
  async searchPlans(@Param('productionId') productionId: number) {
    return this.planService.searchPlans({ productionId });
  }

  @Patch()
  async updatePlan(@Param('productionId') productionId: number, @Body() dto: UpdateProductionPlanDto) {
    return this.planService.updatePlan(productionId, dto);
  }

  @Delete()
  async deletePlan(@Param('productionId', ParseIntPipe) productionId: number) {
    return await this.planService.deletePlan(productionId);
  }
}
