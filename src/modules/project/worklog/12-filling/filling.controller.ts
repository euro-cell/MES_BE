import { Controller, Post, Body, Param, Get, Patch, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { FillingService } from './filling.service';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { CreateFillingWorklogDto, FillingWorklogListResponseDto, UpdateFillingWorklogDto } from 'src/common/dtos/worklog/12-filling.dto';
import { SessionAuthGuard } from 'src/common/guards/session-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { RequirePermission } from 'src/common/decorators/permission.decorator';
import { MenuName, PermissionAction } from 'src/common/enums/menu.enum';

@ApiTags('Production Worklog - Filling')
@Controller(':projectId/worklog')
@UseGuards(SessionAuthGuard, PermissionGuard)
export class FillingController {
  constructor(private readonly fillingService: FillingService) {}

  @Post('filling')
  @RequirePermission(MenuName.WORKLOG, PermissionAction.CREATE)
  async createFillingWorklog(@Param('projectId', ParseIntPipe) projectId: number, @Body() dto: CreateFillingWorklogDto) {
    return await this.fillingService.createFillingWorklog(projectId, dto);
  }

  @Get('filling')
  @ApiOkResponse({ description: '작업일지-필링 목록', type: [FillingWorklogListResponseDto] })
  async getWorklogs(@Param('projectId', ParseIntPipe) projectId: number): Promise<FillingWorklogListResponseDto[]> {
    return await this.fillingService.getWorklogs(projectId);
  }

  @Get(':worklogId/filling')
  async getWorklogById(@Param('projectId', ParseIntPipe) projectId: number, @Param('worklogId') worklogId: string) {
    return await this.fillingService.findWorklogById(worklogId);
  }

  @Patch(':worklogId/filling')
  @RequirePermission(MenuName.WORKLOG, PermissionAction.UPDATE)
  async updateFillingWorklog(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('worklogId') worklogId: string,
    @Body() updateFillingWorklogDto: UpdateFillingWorklogDto,
  ) {
    return await this.fillingService.updateFillingWorklog(worklogId, updateFillingWorklogDto);
  }

  @Delete(':worklogId/filling')
  @RequirePermission(MenuName.WORKLOG, PermissionAction.DELETE)
  async deleteFillingWorklog(@Param('projectId', ParseIntPipe) projectId: number, @Param('worklogId') worklogId: string) {
    return await this.fillingService.deleteFillingWorklog(worklogId);
  }
}
