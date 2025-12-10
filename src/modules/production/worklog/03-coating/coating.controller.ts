import { Controller, Post, Body, Param, Get, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { CoatingService } from './coating.service';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { CreateCoatingWorklogDto, CoatingWorklogListResponseDto, UpdateCoatingWorklogDto } from 'src/common/dtos/worklog/03-coating.dto';

@ApiTags('Production Worklog - Coating')
@Controller(':productionId/worklog')
export class CoatingController {
  constructor(private readonly coatingService: CoatingService) {}

  @Post('coating')
  async createCoatingWorklog(@Param('productionId', ParseIntPipe) productionId: number, @Body() dto: CreateCoatingWorklogDto) {
    return await this.coatingService.createCoatingWorklog(productionId, dto);
  }

  @Get('coating')
  @ApiOkResponse({ description: '작업일지-코팅 목록', type: [CoatingWorklogListResponseDto] })
  async getWorklogs(@Param('productionId', ParseIntPipe) productionId: number): Promise<CoatingWorklogListResponseDto[]> {
    return await this.coatingService.getWorklogs(productionId);
  }

  @Get(':worklogId/coating')
  async getWorklogById(@Param('productionId', ParseIntPipe) productionId: number, @Param('worklogId') worklogId: string) {
    return await this.coatingService.findWorklogById(worklogId);
  }

  @Patch(':worklogId/coating')
  async updateCoatingWorklog(
    @Param('productionId', ParseIntPipe) productionId: number,
    @Param('worklogId') worklogId: string,
    @Body() updateCoatingWorklogDto: UpdateCoatingWorklogDto,
  ) {
    return await this.coatingService.updateCoatingWorklog(worklogId, updateCoatingWorklogDto);
  }

  @Delete(':worklogId/coating')
  async deleteCoatingWorklog(@Param('productionId', ParseIntPipe) productionId: number, @Param('worklogId') worklogId: string) {
    return await this.coatingService.deleteCoatingWorklog(worklogId);
  }
}
