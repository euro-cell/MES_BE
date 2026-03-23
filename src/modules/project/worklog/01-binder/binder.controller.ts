import { Controller, Post, Body, Param, Get, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { BinderService } from './binder.service';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { CreateBinderWorklogDto, BinderWorklogListResponseDto, UpdateBinderWorklogDto } from 'src/common/dtos/worklog/01-binder.dto';

@ApiTags('Production Worklog - Binder')
@Controller(':productionId/worklog')
export class BinderController {
  constructor(private readonly binderService: BinderService) {}

  @Post('binder')
  async createBinderWorklog(@Param('productionId', ParseIntPipe) productionId: number, @Body() dto: CreateBinderWorklogDto) {
    return await this.binderService.createBinderWorklog(productionId, dto);
  }

  @Get('binder')
  @ApiOkResponse({ description: '작업일지-바인더 목록', type: [BinderWorklogListResponseDto] })
  async getWorklogs(@Param('productionId', ParseIntPipe) productionId: number): Promise<BinderWorklogListResponseDto[]> {
    return await this.binderService.getWorklogs(productionId);
  }

  @Get('binder/lots')
  @ApiOkResponse({ description: 'Binder 작업일지 LOT 목록' })
  async getBinderLots(@Param('productionId', ParseIntPipe) productionId: number) {
    return await this.binderService.getBinderLots(productionId);
  }

  @Get(':worklogId/binder')
  async getWorklogById(@Param('productionId', ParseIntPipe) productionId: number, @Param('worklogId') worklogId: string) {
    return await this.binderService.findWorklogById(worklogId);
  }

  @Patch(':worklogId/binder')
  async updateBinderWorklog(
    @Param('productionId', ParseIntPipe) productionId: number,
    @Param('worklogId') worklogId: string,
    @Body() updateBinderWorklogDto: UpdateBinderWorklogDto,
  ) {
    return await this.binderService.updateBinderWorklog(worklogId, updateBinderWorklogDto);
  }

  @Delete(':worklogId/binder')
  async deleteBinderWorklog(@Param('productionId', ParseIntPipe) productionId: number, @Param('worklogId') worklogId: string) {
    return await this.binderService.deleteBinderWorklog(worklogId);
  }
}
