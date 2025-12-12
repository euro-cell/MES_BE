import { Controller, Post, Body, Param, Get, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { GradingService } from './grading.service';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { CreateGradingWorklogDto, GradingWorklogListResponseDto, UpdateGradingWorklogDto } from 'src/common/dtos/worklog/14-grading.dto';

@ApiTags('Production Worklog - Grading')
@Controller(':productionId/worklog')
export class GradingController {
  constructor(private readonly gradingService: GradingService) {}

  @Post('grading')
  async createGradingWorklog(@Param('productionId', ParseIntPipe) productionId: number, @Body() dto: CreateGradingWorklogDto) {
    return await this.gradingService.createGradingWorklog(productionId, dto);
  }

  @Get('grading')
  @ApiOkResponse({ description: '작업일지-그레이딩 목록', type: [GradingWorklogListResponseDto] })
  async getWorklogs(@Param('productionId', ParseIntPipe) productionId: number): Promise<GradingWorklogListResponseDto[]> {
    return await this.gradingService.getWorklogs(productionId);
  }

  @Get(':worklogId/grading')
  async getWorklogById(@Param('productionId', ParseIntPipe) productionId: number, @Param('worklogId') worklogId: string) {
    return await this.gradingService.findWorklogById(worklogId);
  }

  @Patch(':worklogId/grading')
  async updateGradingWorklog(
    @Param('productionId', ParseIntPipe) productionId: number,
    @Param('worklogId') worklogId: string,
    @Body() updateGradingWorklogDto: UpdateGradingWorklogDto,
  ) {
    return await this.gradingService.updateGradingWorklog(worklogId, updateGradingWorklogDto);
  }

  @Delete(':worklogId/grading')
  async deleteGradingWorklog(@Param('productionId', ParseIntPipe) productionId: number, @Param('worklogId') worklogId: string) {
    return await this.gradingService.deleteGradingWorklog(worklogId);
  }
}
