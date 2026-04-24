import { Controller, Post, Body, Param, Get, Patch, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { FormationService } from './formation.service';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { CreateFormationWorklogDto, FormationWorklogListResponseDto, UpdateFormationWorklogDto } from 'src/common/dtos/worklog/13-formation.dto';
import { SessionAuthGuard } from 'src/common/guards/session-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { RequirePermission } from 'src/common/decorators/permission.decorator';
import { MenuName, PermissionAction } from 'src/common/enums/menu.enum';

@ApiTags('Production Worklog - Formation')
@Controller(':projectId/worklog')
@UseGuards(SessionAuthGuard, PermissionGuard)
export class FormationController {
  constructor(private readonly formationService: FormationService) {}

  @Post('formation')
  @RequirePermission(MenuName.WORKLOG, PermissionAction.CREATE)
  async createFormationWorklog(@Param('projectId', ParseIntPipe) projectId: number, @Body() dto: CreateFormationWorklogDto) {
    return await this.formationService.createFormationWorklog(projectId, dto);
  }

  @Get('formation')
  @ApiOkResponse({ description: '작업일지-포메이션 목록', type: [FormationWorklogListResponseDto] })
  async getWorklogs(@Param('projectId', ParseIntPipe) projectId: number): Promise<FormationWorklogListResponseDto[]> {
    return await this.formationService.getWorklogs(projectId);
  }

  @Get(':worklogId/formation')
  async getWorklogById(@Param('projectId', ParseIntPipe) projectId: number, @Param('worklogId') worklogId: string) {
    return await this.formationService.findWorklogById(worklogId);
  }

  @Patch(':worklogId/formation')
  @RequirePermission(MenuName.WORKLOG, PermissionAction.UPDATE)
  async updateFormationWorklog(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('worklogId') worklogId: string,
    @Body() updateFormationWorklogDto: UpdateFormationWorklogDto,
  ) {
    return await this.formationService.updateFormationWorklog(worklogId, updateFormationWorklogDto);
  }

  @Delete(':worklogId/formation')
  @RequirePermission(MenuName.WORKLOG, PermissionAction.DELETE)
  async deleteFormationWorklog(@Param('projectId', ParseIntPipe) projectId: number, @Param('worklogId') worklogId: string) {
    return await this.formationService.deleteFormationWorklog(worklogId);
  }
}
