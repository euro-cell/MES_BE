import { Controller, Post, Body, Param, Get, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { PressService } from './04-press.service';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { CreatePressWorklogDto, PressWorklogListResponseDto, UpdatePressWorklogDto } from 'src/common/dtos/worklog/04-press.dto';

@ApiTags('Production Worklog - Press')
@Controller(':projectId/worklog')
export class PressController {
  constructor(private readonly pressService: PressService) {}

  @Post('press')
  async createPressWorklog(@Param('projectId', ParseIntPipe) projectId: number, @Body() dto: CreatePressWorklogDto) {
    return await this.pressService.createPressWorklog(projectId, dto);
  }

  @Get('press')
  @ApiOkResponse({ description: '작업일지-프레스 목록', type: [PressWorklogListResponseDto] })
  async getWorklogs(@Param('projectId', ParseIntPipe) projectId: number): Promise<PressWorklogListResponseDto[]> {
    return await this.pressService.getWorklogs(projectId);
  }

  @Get(':worklogId/press')
  async getWorklogById(@Param('projectId', ParseIntPipe) projectId: number, @Param('worklogId') worklogId: string) {
    return await this.pressService.findWorklogById(worklogId);
  }

  @Patch(':worklogId/press')
  async updatePressWorklog(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('worklogId') worklogId: string,
    @Body() updatePressWorklogDto: UpdatePressWorklogDto,
  ) {
    return await this.pressService.updatePressWorklog(worklogId, updatePressWorklogDto);
  }

  @Delete(':worklogId/press')
  async deletePressWorklog(@Param('projectId', ParseIntPipe) projectId: number, @Param('worklogId') worklogId: string) {
    return await this.pressService.deletePressWorklog(worklogId);
  }
}
