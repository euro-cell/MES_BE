import { Controller, Post, Body, Param, Get, Patch, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { StackingService } from './stacking.service';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import {
  CreateStackingWorklogDto,
  StackingWorklogListResponseDto,
  UpdateStackingWorklogDto,
} from 'src/common/dtos/worklog/09-stacking.dto';
import { SessionAuthGuard } from 'src/common/guards/session-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { RequirePermission } from 'src/common/decorators/permission.decorator';
import { MenuName, PermissionAction } from 'src/common/enums/menu.enum';

@ApiTags('Production Worklog - Stacking')
@Controller(':projectId/worklog')
@UseGuards(SessionAuthGuard, PermissionGuard)
export class StackingController {
  constructor(private readonly stackingService: StackingService) {}

  @Post('stacking')
  @RequirePermission(MenuName.WORKLOG, PermissionAction.CREATE)
  async createStackingWorklog(@Param('projectId', ParseIntPipe) projectId: number, @Body() dto: CreateStackingWorklogDto) {
    return await this.stackingService.createStackingWorklog(projectId, dto);
  }

  @Get('stacking')
  @ApiOkResponse({ description: '작업일지-스택 목록', type: [StackingWorklogListResponseDto] })
  async getWorklogs(@Param('projectId', ParseIntPipe) projectId: number): Promise<StackingWorklogListResponseDto[]> {
    return await this.stackingService.getWorklogs(projectId);
  }

  @Get(':worklogId/stacking')
  async getWorklogById(@Param('projectId', ParseIntPipe) projectId: number, @Param('worklogId') worklogId: string) {
    return await this.stackingService.findWorklogById(worklogId);
  }

  @Patch(':worklogId/stacking')
  @RequirePermission(MenuName.WORKLOG, PermissionAction.UPDATE)
  async updateStackingWorklog(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('worklogId') worklogId: string,
    @Body() updateStackingWorklogDto: UpdateStackingWorklogDto,
  ) {
    return await this.stackingService.updateStackingWorklog(worklogId, updateStackingWorklogDto);
  }

  @Delete(':worklogId/stacking')
  @RequirePermission(MenuName.WORKLOG, PermissionAction.DELETE)
  async deleteStackingWorklog(@Param('projectId', ParseIntPipe) projectId: number, @Param('worklogId') worklogId: string) {
    return await this.stackingService.deleteStackingWorklog(worklogId);
  }
}
