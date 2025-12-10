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
