import { Controller, Post, Body, Param, Get, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { FormationService } from './formation.service';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { CreateFormationWorklogDto, FormationWorklogListResponseDto, UpdateFormationWorklogDto } from 'src/common/dtos/worklog/13-formation.dto';

@ApiTags('Production Worklog - Formation')
@Controller(':productionId/worklog')
export class FormationController {
  constructor(private readonly formationService: FormationService) {}

  @Post('formation')
  async createFormationWorklog(@Param('productionId', ParseIntPipe) productionId: number, @Body() dto: CreateFormationWorklogDto) {
    return await this.formationService.createFormationWorklog(productionId, dto);
  }

  @Get('formation')
  @ApiOkResponse({ description: '작업일지-포메이션 목록', type: [FormationWorklogListResponseDto] })
  async getWorklogs(@Param('productionId', ParseIntPipe) productionId: number): Promise<FormationWorklogListResponseDto[]> {
    return await this.formationService.getWorklogs(productionId);
  }

  @Get(':worklogId/formation')
  async getWorklogById(@Param('productionId', ParseIntPipe) productionId: number, @Param('worklogId') worklogId: string) {
    return await this.formationService.findWorklogById(worklogId);
  }

  @Patch(':worklogId/formation')
  async updateFormationWorklog(
    @Param('productionId', ParseIntPipe) productionId: number,
    @Param('worklogId') worklogId: string,
    @Body() updateFormationWorklogDto: UpdateFormationWorklogDto,
  ) {
    return await this.formationService.updateFormationWorklog(worklogId, updateFormationWorklogDto);
  }

  @Delete(':worklogId/formation')
  async deleteFormationWorklog(@Param('productionId', ParseIntPipe) productionId: number, @Param('worklogId') worklogId: string) {
    return await this.formationService.deleteFormationWorklog(worklogId);
  }
}
