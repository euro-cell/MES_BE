import { Controller, Post, Body, Param, Get, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { SlurryService } from './slurry.service';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { CreateSlurryWorklogDto, SlurryWorklogListResponseDto, UpdateSlurryWorklogDto } from 'src/common/dtos/worklog/02-slurry.dto';

@ApiTags('Production Worklog - Slurry')
@Controller(':productionId/worklog')
export class SlurryController {
  constructor(private readonly slurryService: SlurryService) {}

  @Post('slurry')
  async createSlurryWorklog(
    @Param('productionId', ParseIntPipe) productionId: number,
    @Body() createSlurryWorklogDto: CreateSlurryWorklogDto,
  ) {
    return await this.slurryService.createSlurryWorklog(productionId, createSlurryWorklogDto);
  }

  @Get('slurry')
  @ApiOkResponse({ description: '작업일지-슬러리 목록', type: [SlurryWorklogListResponseDto] })
  async getWorklogs(@Param('productionId', ParseIntPipe) productionId: number): Promise<SlurryWorklogListResponseDto[]> {
    return await this.slurryService.getWorklogs(productionId);
  }

  @Get('slurry/lots')
  @ApiOkResponse({ description: '슬러리 LOT 목록 (고형분, 점도 포함)' })
  async getLots(@Param('productionId', ParseIntPipe) productionId: number) {
    return await this.slurryService.getLots(productionId);
  }

  @Get('slurry/mixing-info')
  @ApiOkResponse({ description: 'Binder 작업일지용 Slurry 믹싱 정보 (LOT, 작업일, 회차, 바인더 투입량설계)' })
  async getMixingInfoForBinder(@Param('productionId', ParseIntPipe) productionId: number) {
    return await this.slurryService.getMixingInfoForBinder(productionId);
  }

  @Get(':worklogId/slurry')
  async getWorklogById(@Param('productionId', ParseIntPipe) productionId: number, @Param('worklogId') worklogId: string) {
    return await this.slurryService.findWorklogById(worklogId);
  }

  @Patch(':worklogId/slurry')
  async updateSlurryWorklog(
    @Param('productionId', ParseIntPipe) productionId: number,
    @Param('worklogId') worklogId: string,
    @Body() updateSlurryWorklogDto: UpdateSlurryWorklogDto,
  ) {
    return await this.slurryService.updateSlurryWorklog(worklogId, updateSlurryWorklogDto);
  }

  @Delete(':worklogId/slurry')
  async deleteSlurryWorklog(@Param('productionId', ParseIntPipe) productionId: number, @Param('worklogId') worklogId: string) {
    return await this.slurryService.deleteSlurryWorklog(worklogId);
  }
}
