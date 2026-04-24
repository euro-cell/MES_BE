import { Controller, Post, Body, Param, Get, Patch, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { VdService } from './vd.service';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { CreateVdWorklogDto, VdWorklogListResponseDto, UpdateVdWorklogDto } from 'src/common/dtos/worklog/07-vd.dto';
import { SessionAuthGuard } from 'src/common/guards/session-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { RequirePermission } from 'src/common/decorators/permission.decorator';
import { MenuName, PermissionAction } from 'src/common/enums/menu.enum';

@ApiTags('Production Worklog - VD')
@Controller(':projectId/worklog')
@UseGuards(SessionAuthGuard, PermissionGuard)
export class VdController {
  constructor(private readonly vdService: VdService) {}

  @Post('vd')
  @RequirePermission(MenuName.WORKLOG, PermissionAction.CREATE)
  async createVdWorklog(@Param('projectId', ParseIntPipe) projectId: number, @Body() dto: CreateVdWorklogDto) {
    return await this.vdService.createVdWorklog(projectId, dto);
  }

  @Get('vd')
  @ApiOkResponse({ description: '작업일지-VD 목록', type: [VdWorklogListResponseDto] })
  async getWorklogs(@Param('projectId', ParseIntPipe) projectId: number): Promise<VdWorklogListResponseDto[]> {
    return await this.vdService.getWorklogs(projectId);
  }

  @Get(':worklogId/vd')
  async getWorklogById(@Param('projectId', ParseIntPipe) projectId: number, @Param('worklogId') worklogId: string) {
    return await this.vdService.findWorklogById(worklogId);
  }

  @Patch(':worklogId/vd')
  @RequirePermission(MenuName.WORKLOG, PermissionAction.UPDATE)
  async updateVdWorklog(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('worklogId') worklogId: string,
    @Body() updateVdWorklogDto: UpdateVdWorklogDto,
  ) {
    return await this.vdService.updateVdWorklog(worklogId, updateVdWorklogDto);
  }

  @Delete(':worklogId/vd')
  @RequirePermission(MenuName.WORKLOG, PermissionAction.DELETE)
  async deleteVdWorklog(@Param('projectId', ParseIntPipe) projectId: number, @Param('worklogId') worklogId: string) {
    return await this.vdService.deleteVdWorklog(worklogId);
  }
}
