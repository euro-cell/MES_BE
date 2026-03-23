import { Controller, Post, Body, Param, Get, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { VdService } from './vd.service';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { CreateVdWorklogDto, VdWorklogListResponseDto, UpdateVdWorklogDto } from 'src/common/dtos/worklog/07-vd.dto';

@ApiTags('Production Worklog - VD')
@Controller(':productionId/worklog')
export class VdController {
  constructor(private readonly vdService: VdService) {}

  @Post('vd')
  async createVdWorklog(@Param('productionId', ParseIntPipe) productionId: number, @Body() dto: CreateVdWorklogDto) {
    return await this.vdService.createVdWorklog(productionId, dto);
  }

  @Get('vd')
  @ApiOkResponse({ description: '작업일지-VD 목록', type: [VdWorklogListResponseDto] })
  async getWorklogs(@Param('productionId', ParseIntPipe) productionId: number): Promise<VdWorklogListResponseDto[]> {
    return await this.vdService.getWorklogs(productionId);
  }

  @Get(':worklogId/vd')
  async getWorklogById(@Param('productionId', ParseIntPipe) productionId: number, @Param('worklogId') worklogId: string) {
    return await this.vdService.findWorklogById(worklogId);
  }

  @Patch(':worklogId/vd')
  async updateVdWorklog(
    @Param('productionId', ParseIntPipe) productionId: number,
    @Param('worklogId') worklogId: string,
    @Body() updateVdWorklogDto: UpdateVdWorklogDto,
  ) {
    return await this.vdService.updateVdWorklog(worklogId, updateVdWorklogDto);
  }

  @Delete(':worklogId/vd')
  async deleteVdWorklog(@Param('productionId', ParseIntPipe) productionId: number, @Param('worklogId') worklogId: string) {
    return await this.vdService.deleteVdWorklog(worklogId);
  }
}
