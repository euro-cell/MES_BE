import { Controller, Post, Body, Param, Get, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { WeldingService } from './welding.service';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { CreateWeldingWorklogDto, WeldingWorklogListResponseDto, UpdateWeldingWorklogDto } from 'src/common/dtos/worklog/10-welding.dto';

@ApiTags('Production Worklog - Welding')
@Controller(':productionId/worklog')
export class WeldingController {
  constructor(private readonly weldingService: WeldingService) {}

  @Post('welding')
  async createWeldingWorklog(@Param('productionId', ParseIntPipe) productionId: number, @Body() dto: CreateWeldingWorklogDto) {
    return await this.weldingService.createWeldingWorklog(productionId, dto);
  }

  @Get('welding')
  @ApiOkResponse({ description: '작업일지-웰딩 목록', type: [WeldingWorklogListResponseDto] })
  async getWorklogs(@Param('productionId', ParseIntPipe) productionId: number): Promise<WeldingWorklogListResponseDto[]> {
    return await this.weldingService.getWorklogs(productionId);
  }

  @Get(':worklogId/welding')
  async getWorklogById(@Param('productionId', ParseIntPipe) productionId: number, @Param('worklogId') worklogId: string) {
    return await this.weldingService.findWorklogById(worklogId);
  }

  @Patch(':worklogId/welding')
  async updateWeldingWorklog(
    @Param('productionId', ParseIntPipe) productionId: number,
    @Param('worklogId') worklogId: string,
    @Body() updateWeldingWorklogDto: UpdateWeldingWorklogDto,
  ) {
    return await this.weldingService.updateWeldingWorklog(worklogId, updateWeldingWorklogDto);
  }

  @Delete(':worklogId/welding')
  async deleteWeldingWorklog(@Param('productionId', ParseIntPipe) productionId: number, @Param('worklogId') worklogId: string) {
    return await this.weldingService.deleteWeldingWorklog(worklogId);
  }
}
