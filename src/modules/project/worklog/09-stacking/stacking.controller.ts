import { Controller, Post, Body, Param, Get, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { StackingService } from './stacking.service';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import {
  CreateStackingWorklogDto,
  StackingWorklogListResponseDto,
  UpdateStackingWorklogDto,
} from 'src/common/dtos/worklog/09-stacking.dto';

@ApiTags('Production Worklog - Stacking')
@Controller(':projectId/worklog')
export class StackingController {
  constructor(private readonly stackingService: StackingService) {}

  @Post('stacking')
  async createStackingWorklog(@Param('projectId', ParseIntPipe) projectId: number, @Body() dto: CreateStackingWorklogDto) {
    return await this.stackingService.createStackingWorklog(projectId, dto);
  }

  @Get('stacking')
  @ApiOkResponse({ description: '작업일지-스택 목록', type: [StackingWorklogListResponseDto] })
  async getWorklogs(@Param('projectId', ParseIntPipe) projectId: number): Promise<StackingWorklogListResponseDto[]> {
    return await this.stackingService.getWorklogs(projectId);
  }

  @Get(':worklogId/stacking')
  async getWorklogById(@Param('projectId', ParseIntPipe) projectId: number, @Param('worklogId') worklogId: string) {
    return await this.stackingService.findWorklogById(worklogId);
  }

  @Patch(':worklogId/stacking')
  async updateStackingWorklog(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('worklogId') worklogId: string,
    @Body() updateStackingWorklogDto: UpdateStackingWorklogDto,
  ) {
    return await this.stackingService.updateStackingWorklog(worklogId, updateStackingWorklogDto);
  }

  @Delete(':worklogId/stacking')
  async deleteStackingWorklog(@Param('projectId', ParseIntPipe) projectId: number, @Param('worklogId') worklogId: string) {
    return await this.stackingService.deleteStackingWorklog(worklogId);
  }
}
