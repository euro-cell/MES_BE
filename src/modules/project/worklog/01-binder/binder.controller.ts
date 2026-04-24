import { Controller, Post, Body, Param, Get, Patch, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { BinderService } from './binder.service';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { CreateBinderWorklogDto, BinderWorklogListResponseDto, UpdateBinderWorklogDto } from 'src/common/dtos/worklog/01-binder.dto';
import { SessionAuthGuard } from 'src/common/guards/session-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { RequirePermission } from 'src/common/decorators/permission.decorator';
import { MenuName, PermissionAction } from 'src/common/enums/menu.enum';

@ApiTags('Production Worklog - Binder')
@Controller(':projectId/worklog')
@UseGuards(SessionAuthGuard, PermissionGuard)
export class BinderController {
  constructor(private readonly binderService: BinderService) {}

  @Post('binder')
  @RequirePermission(MenuName.WORKLOG, PermissionAction.CREATE)
  async createBinderWorklog(@Param('projectId', ParseIntPipe) projectId: number, @Body() dto: CreateBinderWorklogDto) {
    return await this.binderService.createBinderWorklog(projectId, dto);
  }

  @Get('binder')
  @ApiOkResponse({ description: '작업일지-바인더 목록', type: [BinderWorklogListResponseDto] })
  async getWorklogs(@Param('projectId', ParseIntPipe) projectId: number): Promise<BinderWorklogListResponseDto[]> {
    return await this.binderService.getWorklogs(projectId);
  }

  @Get('binder/lots')
  @ApiOkResponse({ description: 'Binder 작업일지 LOT 목록' })
  async getBinderLots(@Param('projectId', ParseIntPipe) projectId: number) {
    return await this.binderService.getBinderLots(projectId);
  }

  @Get(':worklogId/binder')
  async getWorklogById(@Param('projectId', ParseIntPipe) projectId: number, @Param('worklogId') worklogId: string) {
    return await this.binderService.findWorklogById(worklogId);
  }

  @Patch(':worklogId/binder')
  @RequirePermission(MenuName.WORKLOG, PermissionAction.UPDATE)
  async updateBinderWorklog(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('worklogId') worklogId: string,
    @Body() updateBinderWorklogDto: UpdateBinderWorklogDto,
  ) {
    return await this.binderService.updateBinderWorklog(worklogId, updateBinderWorklogDto);
  }

  @Delete(':worklogId/binder')
  @RequirePermission(MenuName.WORKLOG, PermissionAction.DELETE)
  async deleteBinderWorklog(@Param('projectId', ParseIntPipe) projectId: number, @Param('worklogId') worklogId: string) {
    return await this.binderService.deleteBinderWorklog(worklogId);
  }
}
