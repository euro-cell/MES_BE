import { Controller, Post, Body, Param, Get, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { VdService } from './vd.service';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { CreateVdWorklogDto, VdWorklogListResponseDto, UpdateVdWorklogDto } from 'src/common/dtos/worklog/07-vd.dto';

@ApiTags('Production Worklog - VD')
@Controller(':projectId/worklog')
export class VdController {
  constructor(private readonly vdService: VdService) {}

  @Post('vd')
  async createVdWorklog(@Param('projectId', ParseIntPipe) projectId: number, @Body() dto: CreateVdWorklogDto) {
    return await this.vdService.createVdWorklog(projectId, dto);
  }

  @Get('vd')
  @ApiOkResponse({ description: '작업일지-VD 목록', type: [VdWorklogListResponseDto] })
  async getWorklogs(@Param('projectId', ParseIntPipe) projectId: number): Promise<VdWorklogListResponseDto[]> {
    return await this.vdService.getWorklogs(projectId);
  }

  @Get(':worklogId/vd')
  async getWorklogById(@Param('projectId', ParseIntPipe) projectId: number, @Param('worklogId') worklogId: string) {
    return await this.vdService.findWorklogById(worklogId);
  }

  @Patch(':worklogId/vd')
  async updateVdWorklog(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('worklogId') worklogId: string,
    @Body() updateVdWorklogDto: UpdateVdWorklogDto,
  ) {
    return await this.vdService.updateVdWorklog(worklogId, updateVdWorklogDto);
  }

  @Delete(':worklogId/vd')
  async deleteVdWorklog(@Param('projectId', ParseIntPipe) projectId: number, @Param('worklogId') worklogId: string) {
    return await this.vdService.deleteVdWorklog(worklogId);
  }
}
