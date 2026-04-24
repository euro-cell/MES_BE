import { Controller, Post, Body, Param, Get, Patch, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { WeldingService } from './welding.service';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { CreateWeldingWorklogDto, WeldingWorklogListResponseDto, UpdateWeldingWorklogDto } from 'src/common/dtos/worklog/10-welding.dto';
import { SessionAuthGuard } from 'src/common/guards/session-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { RequirePermission } from 'src/common/decorators/permission.decorator';
import { MenuName, PermissionAction } from 'src/common/enums/menu.enum';

@ApiTags('Production Worklog - Welding')
@Controller(':projectId/worklog')
@UseGuards(SessionAuthGuard, PermissionGuard)
export class WeldingController {
  constructor(private readonly weldingService: WeldingService) {}

  @Post('welding')
  @RequirePermission(MenuName.WORKLOG, PermissionAction.CREATE)
  async createWeldingWorklog(@Param('projectId', ParseIntPipe) projectId: number, @Body() dto: CreateWeldingWorklogDto) {
    return await this.weldingService.createWeldingWorklog(projectId, dto);
  }

  @Get('welding')
  @ApiOkResponse({ description: '작업일지-웰딩 목록', type: [WeldingWorklogListResponseDto] })
  async getWorklogs(@Param('projectId', ParseIntPipe) projectId: number): Promise<WeldingWorklogListResponseDto[]> {
    return await this.weldingService.getWorklogs(projectId);
  }

  @Get(':worklogId/welding')
  async getWorklogById(@Param('projectId', ParseIntPipe) projectId: number, @Param('worklogId') worklogId: string) {
    return await this.weldingService.findWorklogById(worklogId);
  }

  @Patch(':worklogId/welding')
  @RequirePermission(MenuName.WORKLOG, PermissionAction.UPDATE)
  async updateWeldingWorklog(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('worklogId') worklogId: string,
    @Body() updateWeldingWorklogDto: UpdateWeldingWorklogDto,
  ) {
    return await this.weldingService.updateWeldingWorklog(worklogId, updateWeldingWorklogDto);
  }

  @Delete(':worklogId/welding')
  @RequirePermission(MenuName.WORKLOG, PermissionAction.DELETE)
  async deleteWeldingWorklog(@Param('projectId', ParseIntPipe) projectId: number, @Param('worklogId') worklogId: string) {
    return await this.weldingService.deleteWeldingWorklog(worklogId);
  }
}
