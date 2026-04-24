import { Controller, Post, Body, Param, Get, Patch, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { SlurryService } from './slurry.service';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { CreateSlurryWorklogDto, SlurryWorklogListResponseDto, UpdateSlurryWorklogDto } from 'src/common/dtos/worklog/02-slurry.dto';
import { SessionAuthGuard } from 'src/common/guards/session-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { RequirePermission } from 'src/common/decorators/permission.decorator';
import { MenuName, PermissionAction } from 'src/common/enums/menu.enum';

@ApiTags('Production Worklog - Slurry')
@Controller(':projectId/worklog')
@UseGuards(SessionAuthGuard, PermissionGuard)
export class SlurryController {
  constructor(private readonly slurryService: SlurryService) {}

  @Post('slurry')
  @RequirePermission(MenuName.WORKLOG, PermissionAction.CREATE)
  async createSlurryWorklog(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() createSlurryWorklogDto: CreateSlurryWorklogDto,
  ) {
    return await this.slurryService.createSlurryWorklog(projectId, createSlurryWorklogDto);
  }

  @Get('slurry')
  @ApiOkResponse({ description: '작업일지-슬러리 목록', type: [SlurryWorklogListResponseDto] })
  async getWorklogs(@Param('projectId', ParseIntPipe) projectId: number): Promise<SlurryWorklogListResponseDto[]> {
    return await this.slurryService.getWorklogs(projectId);
  }

  @Get('slurry/lots')
  @ApiOkResponse({ description: '슬러리 LOT 목록 (고형분, 점도 포함)' })
  async getLots(@Param('projectId', ParseIntPipe) projectId: number) {
    return await this.slurryService.getLots(projectId);
  }

  @Get('slurry/mixing-info')
  @ApiOkResponse({ description: 'Binder 작업일지용 Slurry 믹싱 정보 (LOT, 작업일, 회차, 바인더 투입량설계)' })
  async getMixingInfoForBinder(@Param('projectId', ParseIntPipe) projectId: number) {
    return await this.slurryService.getMixingInfoForBinder(projectId);
  }

  @Get(':worklogId/slurry')
  async getWorklogById(@Param('projectId', ParseIntPipe) projectId: number, @Param('worklogId') worklogId: string) {
    return await this.slurryService.findWorklogById(worklogId);
  }

  @Patch(':worklogId/slurry')
  @RequirePermission(MenuName.WORKLOG, PermissionAction.UPDATE)
  async updateSlurryWorklog(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('worklogId') worklogId: string,
    @Body() updateSlurryWorklogDto: UpdateSlurryWorklogDto,
  ) {
    return await this.slurryService.updateSlurryWorklog(worklogId, updateSlurryWorklogDto);
  }

  @Delete(':worklogId/slurry')
  @RequirePermission(MenuName.WORKLOG, PermissionAction.DELETE)
  async deleteSlurryWorklog(@Param('projectId', ParseIntPipe) projectId: number, @Param('worklogId') worklogId: string) {
    return await this.slurryService.deleteSlurryWorklog(worklogId);
  }
}
