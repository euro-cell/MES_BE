import { Controller, Post, Body, Param, Get, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { CoatingService } from './coating.service';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { CreateCoatingWorklogDto, CoatingWorklogListResponseDto, UpdateCoatingWorklogDto } from 'src/common/dtos/worklog/03-coating.dto';

@ApiTags('Production Worklog - Coating')
@Controller(':projectId/worklog')
export class CoatingController {
  constructor(private readonly coatingService: CoatingService) {}

  @Post('coating')
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
  async updateCoatingWorklog(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('worklogId') worklogId: string,
    @Body() updateCoatingWorklogDto: UpdateCoatingWorklogDto,
  ) {
    return await this.coatingService.updateCoatingWorklog(worklogId, updateCoatingWorklogDto);
  }

  @Delete(':worklogId/coating')
  async deleteCoatingWorklog(@Param('projectId', ParseIntPipe) projectId: number, @Param('worklogId') worklogId: string) {
    return await this.coatingService.deleteCoatingWorklog(worklogId);
  }
}
