import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PlanService } from './plan.service';

@Controller('api/projects/:projectId/plan')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Post('save')
  async saveProjectPlan(
    @Param('projectId') projectId: number,
    @Body() body: Record<string, any>,
  ) {
    return this.planService.savePlan(projectId, body);
  }

  @Get('search')
  async searchPlans(@Param('projectId') projectId: number) {
    return this.planService.searchPlans({ projectId });
  }
}
