import { Controller, Post, Body, Param, Get, Patch, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PressService } from './press.service';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { CreatePressWorklogDto, PressWorklogListResponseDto, UpdatePressWorklogDto } from 'src/common/dtos/worklog/04-press.dto';
import { SessionAuthGuard } from 'src/common/guards/session-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { RequirePermission } from 'src/common/decorators/permission.decorator';
import { MenuName, PermissionAction } from 'src/common/enums/menu.enum';

@ApiTags('Production Worklog - Press')
@Controller(':projectId/worklog')
@UseGuards(SessionAuthGuard, PermissionGuard)
export class PressController {
  constructor(private readonly pressService: PressService) {}

  @Post('press')
  @RequirePermission(MenuName.WORKLOG, PermissionAction.CREATE)
  async createPressWorklog(@Param('projectId', ParseIntPipe) projectId: number, @Body() dto: CreatePressWorklogDto) {
    return await this.pressService.createPressWorklog(projectId, dto);
  }

  @Get('press')
  @ApiOkResponse({ description: '작업일지-프레스 목록', type: [PressWorklogListResponseDto] })
  async getWorklogs(@Param('projectId', ParseIntPipe) projectId: number): Promise<PressWorklogListResponseDto[]> {
    return await this.pressService.getWorklogs(projectId);
  }

  @Get(':worklogId/press')
  async getWorklogById(@Param('projectId', ParseIntPipe) projectId: number, @Param('worklogId') worklogId: string) {
    return await this.pressService.findWorklogById(worklogId);
  }

  @Patch(':worklogId/press')
  @RequirePermission(MenuName.WORKLOG, PermissionAction.UPDATE)
  async updatePressWorklog(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('worklogId') worklogId: string,
    @Body() updatePressWorklogDto: UpdatePressWorklogDto,
  ) {
    return await this.pressService.updatePressWorklog(worklogId, updatePressWorklogDto);
  }

  @Delete(':worklogId/press')
  @RequirePermission(MenuName.WORKLOG, PermissionAction.DELETE)
  async deletePressWorklog(@Param('projectId', ParseIntPipe) projectId: number, @Param('worklogId') worklogId: string) {
    return await this.pressService.deletePressWorklog(worklogId);
  }
}
