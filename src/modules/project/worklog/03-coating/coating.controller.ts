import { Controller, Post, Body, Param, Get, Patch, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CoatingService } from './coating.service';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { CreateCoatingWorklogDto, CoatingWorklogListResponseDto, UpdateCoatingWorklogDto } from 'src/common/dtos/worklog/03-coating.dto';
import { SessionAuthGuard } from 'src/common/guards/session-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { RequirePermission } from 'src/common/decorators/permission.decorator';
import { MenuName, PermissionAction } from 'src/common/enums/menu.enum';

@ApiTags('Production Worklog - Coating')
@Controller(':projectId/worklog')
@UseGuards(SessionAuthGuard, PermissionGuard)
export class CoatingController {
  constructor(private readonly coatingService: CoatingService) {}

  @Post('coating')
  @RequirePermission(MenuName.WORKLOG, PermissionAction.CREATE)
  async createCoatingWorklog(@Param('projectId', ParseIntPipe) projectId: number, @Body() dto: CreateCoatingWorklogDto) {
    return await this.coatingService.createCoatingWorklog(projectId, dto);
  }

  @Get('coating')
  @ApiOkResponse({ description: '작업일지-코팅 목록', type: [CoatingWorklogListResponseDto] })
  async getWorklogs(@Param('projectId', ParseIntPipe) projectId: number): Promise<CoatingWorklogListResponseDto[]> {
    return await this.coatingService.getWorklogs(projectId);
  }

  @Get(':worklogId/coating')
  async getWorklogById(@Param('projectId', ParseIntPipe) projectId: number, @Param('worklogId') worklogId: string) {
    return await this.coatingService.findWorklogById(worklogId);
  }

  @Patch(':worklogId/coating')
  @RequirePermission(MenuName.WORKLOG, PermissionAction.UPDATE)
  async updateCoatingWorklog(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('worklogId') worklogId: string,
    @Body() updateCoatingWorklogDto: UpdateCoatingWorklogDto,
  ) {
    return await this.coatingService.updateCoatingWorklog(worklogId, updateCoatingWorklogDto);
  }

  @Delete(':worklogId/coating')
  @RequirePermission(MenuName.WORKLOG, PermissionAction.DELETE)
  async deleteCoatingWorklog(@Param('projectId', ParseIntPipe) projectId: number, @Param('worklogId') worklogId: string) {
    return await this.coatingService.deleteCoatingWorklog(worklogId);
  }
}
