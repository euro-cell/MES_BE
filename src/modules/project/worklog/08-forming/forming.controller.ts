import { Controller, Post, Body, Param, Get, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { FormingService } from './forming.service';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { CreateFormingWorklogDto, FormingWorklogListResponseDto, UpdateFormingWorklogDto } from 'src/common/dtos/worklog/08-forming.dto';

@ApiTags('Production Worklog - Forming')
@Controller(':projectId/worklog')
export class FormingController {
  constructor(private readonly formingService: FormingService) {}

  @Post('forming')
  async createFormingWorklog(@Param('projectId', ParseIntPipe) projectId: number, @Body() dto: CreateFormingWorklogDto) {
    return await this.formingService.createFormingWorklog(projectId, dto);
  }

  @Get('forming')
  @ApiOkResponse({ description: '작업일지-포밍 목록', type: [FormingWorklogListResponseDto] })
  async getWorklogs(@Param('projectId', ParseIntPipe) projectId: number): Promise<FormingWorklogListResponseDto[]> {
    return await this.formingService.getWorklogs(projectId);
  }

  @Get(':worklogId/forming')
  async getWorklogById(@Param('projectId', ParseIntPipe) projectId: number, @Param('worklogId') worklogId: string) {
    return await this.formingService.findWorklogById(worklogId);
  }

  @Patch(':worklogId/forming')
  async updateFormingWorklog(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('worklogId') worklogId: string,
    @Body() updateFormingWorklogDto: UpdateFormingWorklogDto,
  ) {
    return await this.formingService.updateFormingWorklog(worklogId, updateFormingWorklogDto);
  }

  @Delete(':worklogId/forming')
  async deleteFormingWorklog(@Param('projectId', ParseIntPipe) projectId: number, @Param('worklogId') worklogId: string) {
    return await this.formingService.deleteFormingWorklog(worklogId);
  }
}
