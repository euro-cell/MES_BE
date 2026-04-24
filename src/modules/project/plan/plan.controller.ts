import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { PlanService } from './plan.service';
import { CreateProjectPlanDto, UpdateProjectPlanDto } from 'src/common/dtos/project/project-plan.dto';
import { SessionAuthGuard } from 'src/common/guards/session-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { RequirePermission } from 'src/common/decorators/permission.decorator';
import { MenuName, PermissionAction } from 'src/common/enums/menu.enum';

@UseGuards(SessionAuthGuard, PermissionGuard)
@Controller(':projectId/plan')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Post()
  @RequirePermission(MenuName.PRODUCTION_PLAN, PermissionAction.CREATE)
  async saveProjectPlan(@Param('projectId') projectId: number, @Body() dto: CreateProjectPlanDto) {
    return this.planService.savePlan(projectId, dto);
  }

  @Get()
  async searchPlans(@Param('projectId') projectId: number) {
    return this.planService.searchPlans({ projectId });
  }

  @Patch()
  @RequirePermission(MenuName.PRODUCTION_PLAN, PermissionAction.UPDATE)
  async updatePlan(@Param('projectId') projectId: number, @Body() dto: UpdateProjectPlanDto) {
    return this.planService.updatePlan(projectId, dto);
  }

  @Delete()
  @RequirePermission(MenuName.PRODUCTION_PLAN, PermissionAction.DELETE)
  async deletePlan(@Param('projectId', ParseIntPipe) projectId: number) {
    return await this.planService.deletePlan(projectId);
  }
}
