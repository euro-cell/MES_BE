import { Controller, Post, Body, Param, Get, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { FormationService } from './formation.service';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { CreateFormationWorklogDto, FormationWorklogListResponseDto, UpdateFormationWorklogDto } from 'src/common/dtos/worklog/13-formation.dto';

@ApiTags('Production Worklog - Formation')
@Controller(':projectId/worklog')
export class FormationController {
  constructor(private readonly formationService: FormationService) {}

  @Post('formation')
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
  async updateFormationWorklog(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('worklogId') worklogId: string,
    @Body() updateFormationWorklogDto: UpdateFormationWorklogDto,
  ) {
    return await this.formationService.updateFormationWorklog(worklogId, updateFormationWorklogDto);
  }

  @Delete(':worklogId/formation')
  async deleteFormationWorklog(@Param('projectId', ParseIntPipe) projectId: number, @Param('worklogId') worklogId: string) {
    return await this.formationService.deleteFormationWorklog(worklogId);
  }
}
