import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { PlanService } from './plan.service';
import { CreateProjectPlanDto, UpdateProjectPlanDto } from 'src/common/dtos/project-plan.dto';

@Controller(':projectId/plan')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Post()
  async saveProjectPlan(@Param('projectId') projectId: number, @Body() dto: CreateProjectPlanDto) {
    return this.planService.savePlan(projectId, dto);
  }

  @Get()
  async searchPlans(@Param('projectId') projectId: number) {
    return this.planService.searchPlans({ projectId });
  }

  @Patch()
  async updatePlan(@Param('projectId') projectId: number, @Body() dto: UpdateProjectPlanDto) {
    return this.planService.updatePlan(projectId, dto);
  }

  @Delete()
  async deletePlan(@Param('projectId', ParseIntPipe) projectId: number) {
    return await this.planService.deletePlan(projectId);
  }
}
