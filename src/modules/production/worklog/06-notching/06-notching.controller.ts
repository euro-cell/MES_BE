import { Controller, Post, Body, Param, Get, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { NotchingService } from './06-notching.service';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { CreateNotchingWorklogDto, NotchingWorklogListResponseDto, UpdateNotchingWorklogDto } from 'src/common/dtos/worklog/06-notching.dto';

@ApiTags('Production Worklog - Notching')
@Controller(':productionId/worklog')
export class NotchingController {
  constructor(private readonly notchingService: NotchingService) {}

  @Post('notching')
  async createNotchingWorklog(@Param('productionId', ParseIntPipe) productionId: number, @Body() dto: CreateNotchingWorklogDto) {
    return await this.notchingService.createNotchingWorklog(productionId, dto);
  }

  @Get('notching')
  @ApiOkResponse({ description: '작업일지-노칭 목록', type: [NotchingWorklogListResponseDto] })
  async getWorklogs(@Param('productionId', ParseIntPipe) productionId: number): Promise<NotchingWorklogListResponseDto[]> {
    return await this.notchingService.getWorklogs(productionId);
  }

  @Get(':worklogId/notching')
  async getWorklogById(@Param('productionId', ParseIntPipe) productionId: number, @Param('worklogId') worklogId: string) {
    return await this.notchingService.findWorklogById(worklogId);
  }

  @Patch(':worklogId/notching')
  async updateNotchingWorklog(
    @Param('productionId', ParseIntPipe) productionId: number,
    @Param('worklogId') worklogId: string,
    @Body() updateNotchingWorklogDto: UpdateNotchingWorklogDto,
  ) {
    return await this.notchingService.updateNotchingWorklog(worklogId, updateNotchingWorklogDto);
  }

  @Delete(':worklogId/notching')
  async deleteNotchingWorklog(@Param('productionId', ParseIntPipe) productionId: number, @Param('worklogId') worklogId: string) {
    return await this.notchingService.deleteNotchingWorklog(worklogId);
  }
}
