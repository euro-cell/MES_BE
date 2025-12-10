import { Controller, Post, Body, Param, Get, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { PressService } from './04-press.service';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { CreatePressWorklogDto, PressWorklogListResponseDto, UpdatePressWorklogDto } from 'src/common/dtos/worklog/04-press.dto';

@ApiTags('Production Worklog - Press')
@Controller(':productionId/worklog')
export class PressController {
  constructor(private readonly pressService: PressService) {}

  @Post('press')
  async createPressWorklog(@Param('productionId', ParseIntPipe) productionId: number, @Body() dto: CreatePressWorklogDto) {
    return await this.pressService.createPressWorklog(productionId, dto);
  }

  @Get('press')
  @ApiOkResponse({ description: '작업일지-프레스 목록', type: [PressWorklogListResponseDto] })
  async getWorklogs(@Param('productionId', ParseIntPipe) productionId: number): Promise<PressWorklogListResponseDto[]> {
    return await this.pressService.getWorklogs(productionId);
  }

  @Get(':worklogId/press')
  async getWorklogById(@Param('productionId', ParseIntPipe) productionId: number, @Param('worklogId') worklogId: string) {
    return await this.pressService.findWorklogById(worklogId);
  }

  @Patch(':worklogId/press')
  async updatePressWorklog(
    @Param('productionId', ParseIntPipe) productionId: number,
    @Param('worklogId') worklogId: string,
    @Body() updatePressWorklogDto: UpdatePressWorklogDto,
  ) {
    return await this.pressService.updatePressWorklog(worklogId, updatePressWorklogDto);
  }

  @Delete(':worklogId/press')
  async deletePressWorklog(@Param('productionId', ParseIntPipe) productionId: number, @Param('worklogId') worklogId: string) {
    return await this.pressService.deletePressWorklog(worklogId);
  }
}
