import { Controller, Post, Body, Param, Get, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { NotchingService } from './notching.service';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { CreateNotchingWorklogDto, NotchingWorklogListResponseDto, UpdateNotchingWorklogDto } from 'src/common/dtos/worklog/06-notching.dto';

@ApiTags('Production Worklog - Notching')
@Controller(':projectId/worklog')
export class NotchingController {
  constructor(private readonly notchingService: NotchingService) {}

  @Post('notching')
  async createNotchingWorklog(@Param('projectId', ParseIntPipe) projectId: number, @Body() dto: CreateNotchingWorklogDto) {
    return await this.notchingService.createNotchingWorklog(projectId, dto);
  }

  @Get('notching')
  @ApiOkResponse({ description: '작업일지-노칭 목록', type: [NotchingWorklogListResponseDto] })
  async getWorklogs(@Param('projectId', ParseIntPipe) projectId: number): Promise<NotchingWorklogListResponseDto[]> {
    return await this.notchingService.getWorklogs(projectId);
  }

  @Get('notching/lots')
  @ApiOkResponse({ description: '노칭 LOT 목록 (양극/음극 구분)' })
  async getLots(@Param('projectId', ParseIntPipe) projectId: number) {
    return await this.notchingService.getLots(projectId);
  }

  @Get(':worklogId/notching')
  async getWorklogById(@Param('projectId', ParseIntPipe) projectId: number, @Param('worklogId') worklogId: string) {
    return await this.notchingService.findWorklogById(worklogId);
  }

  @Patch(':worklogId/notching')
  async updateNotchingWorklog(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('worklogId') worklogId: string,
    @Body() updateNotchingWorklogDto: UpdateNotchingWorklogDto,
  ) {
    return await this.notchingService.updateNotchingWorklog(worklogId, updateNotchingWorklogDto);
  }

  @Delete(':worklogId/notching')
  async deleteNotchingWorklog(@Param('projectId', ParseIntPipe) projectId: number, @Param('worklogId') worklogId: string) {
    return await this.notchingService.deleteNotchingWorklog(worklogId);
  }
}
