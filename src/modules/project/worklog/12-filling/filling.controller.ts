import { Controller, Post, Body, Param, Get, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { FillingService } from './filling.service';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { CreateFillingWorklogDto, FillingWorklogListResponseDto, UpdateFillingWorklogDto } from 'src/common/dtos/worklog/12-filling.dto';

@ApiTags('Production Worklog - Filling')
@Controller(':productionId/worklog')
export class FillingController {
  constructor(private readonly fillingService: FillingService) {}

  @Post('filling')
  async createFillingWorklog(@Param('productionId', ParseIntPipe) productionId: number, @Body() dto: CreateFillingWorklogDto) {
    return await this.fillingService.createFillingWorklog(productionId, dto);
  }

  @Get('filling')
  @ApiOkResponse({ description: '작업일지-필링 목록', type: [FillingWorklogListResponseDto] })
  async getWorklogs(@Param('productionId', ParseIntPipe) productionId: number): Promise<FillingWorklogListResponseDto[]> {
    return await this.fillingService.getWorklogs(productionId);
  }

  @Get(':worklogId/filling')
  async getWorklogById(@Param('productionId', ParseIntPipe) productionId: number, @Param('worklogId') worklogId: string) {
    return await this.fillingService.findWorklogById(worklogId);
  }

  @Patch(':worklogId/filling')
  async updateFillingWorklog(
    @Param('productionId', ParseIntPipe) productionId: number,
    @Param('worklogId') worklogId: string,
    @Body() updateFillingWorklogDto: UpdateFillingWorklogDto,
  ) {
    return await this.fillingService.updateFillingWorklog(worklogId, updateFillingWorklogDto);
  }

  @Delete(':worklogId/filling')
  async deleteFillingWorklog(@Param('productionId', ParseIntPipe) productionId: number, @Param('worklogId') worklogId: string) {
    return await this.fillingService.deleteFillingWorklog(worklogId);
  }
}
