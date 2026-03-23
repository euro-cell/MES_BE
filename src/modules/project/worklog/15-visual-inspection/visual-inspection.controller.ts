import { Controller, Post, Body, Param, Get, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { VisualInspectionService } from './visual-inspection.service';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import {
  CreateVisualInspectionWorklogDto,
  VisualInspectionWorklogListResponseDto,
  UpdateVisualInspectionWorklogDto,
} from 'src/common/dtos/worklog/15-visual-inspection.dto';

@ApiTags('Production Worklog - Visual Inspection')
@Controller(':projectId/worklog')
export class VisualInspectionController {
  constructor(private readonly visualInspectionService: VisualInspectionService) {}

  @Post('inspection')
  async createVisualInspectionWorklog(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: CreateVisualInspectionWorklogDto,
  ) {
    return await this.visualInspectionService.createVisualInspectionWorklog(projectId, dto);
  }

  @Get('inspection')
  @ApiOkResponse({ description: '작업일지-외관검사 목록', type: [VisualInspectionWorklogListResponseDto] })
  async getWorklogs(@Param('projectId', ParseIntPipe) projectId: number): Promise<VisualInspectionWorklogListResponseDto[]> {
    return await this.visualInspectionService.getWorklogs(projectId);
  }

  @Get(':worklogId/inspection')
  async getWorklogById(@Param('projectId', ParseIntPipe) projectId: number, @Param('worklogId') worklogId: string) {
    return await this.visualInspectionService.findWorklogById(worklogId);
  }

  @Patch(':worklogId/inspection')
  async updateVisualInspectionWorklog(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('worklogId') worklogId: string,
    @Body() updateVisualInspectionWorklogDto: UpdateVisualInspectionWorklogDto,
  ) {
    return await this.visualInspectionService.updateVisualInspectionWorklog(worklogId, updateVisualInspectionWorklogDto);
  }

  @Delete(':worklogId/inspection')
  async deleteVisualInspectionWorklog(@Param('projectId', ParseIntPipe) projectId: number, @Param('worklogId') worklogId: string) {
    return await this.visualInspectionService.deleteVisualInspectionWorklog(worklogId);
  }
}
