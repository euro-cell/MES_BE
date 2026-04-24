import { Controller, Post, Body, Param, Get, Patch, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { NotchingService } from './notching.service';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { CreateNotchingWorklogDto, NotchingWorklogListResponseDto, UpdateNotchingWorklogDto } from 'src/common/dtos/worklog/06-notching.dto';
import { SessionAuthGuard } from 'src/common/guards/session-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { RequirePermission } from 'src/common/decorators/permission.decorator';
import { MenuName, PermissionAction } from 'src/common/enums/menu.enum';

@ApiTags('Production Worklog - Notching')
@Controller(':projectId/worklog')
@UseGuards(SessionAuthGuard, PermissionGuard)
export class NotchingController {
  constructor(private readonly notchingService: NotchingService) {}

  @Post('notching')
  @RequirePermission(MenuName.WORKLOG, PermissionAction.CREATE)
  async createNotchingWorklog(@Param('projectId', ParseIntPipe) projectId: number, @Body() dto: CreateNotchingWorklogDto) {
    return await this.notchingService.createNotchingWorklog(projectId, dto);
  }

  @Get('notching')
  @ApiOkResponse({ description: '작업일지-노칭 목록', type: [NotchingWorklogListResponseDto] })
  async getWorklogs(@Param('projectId', ParseIntPipe) projectId: number): Promise<NotchingWorklogListResponseDto[]> {
    return await this.notchingService.getWorklogs(projectId);
  }

  @Get('notching/lots')
  @ApiOkResponse({ description: '노칭 LOT 목록 (양극/음극 구분)' })
  async getLots(@Param('projectId', ParseIntPipe) projectId: number) {
    return await this.notchingService.getLots(projectId);
  }

  @Get(':worklogId/notching')
  async getWorklogById(@Param('projectId', ParseIntPipe) projectId: number, @Param('worklogId') worklogId: string) {
    return await this.notchingService.findWorklogById(worklogId);
  }

  @Patch(':worklogId/notching')
  @RequirePermission(MenuName.WORKLOG, PermissionAction.UPDATE)
  async updateNotchingWorklog(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('worklogId') worklogId: string,
    @Body() updateNotchingWorklogDto: UpdateNotchingWorklogDto,
  ) {
    return await this.notchingService.updateNotchingWorklog(worklogId, updateNotchingWorklogDto);
  }

  @Delete(':worklogId/notching')
  @RequirePermission(MenuName.WORKLOG, PermissionAction.DELETE)
  async deleteNotchingWorklog(@Param('projectId', ParseIntPipe) projectId: number, @Param('worklogId') worklogId: string) {
    return await this.notchingService.deleteNotchingWorklog(worklogId);
  }
}
