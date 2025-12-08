import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { BinderService } from './binder.service';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { CreateBinderWorklogDto, BinderWorklogListResponseDto } from 'src/common/dtos/worklog/binder.dto';

@ApiTags('Production Worklog - Binder')
@Controller(':productionId/worklog')
export class BinderController {
  constructor(private readonly binderService: BinderService) {}

  @Post('binder')
  async createBinderWorklog(@Param('productionId') productionId: string, @Body() createBinderWorklogDto: CreateBinderWorklogDto) {
    return await this.binderService.createBinderWorklog(productionId, createBinderWorklogDto);
  }

  @Get('binder')
  @ApiOkResponse({ description: '작업일지-바인더 목록', type: [BinderWorklogListResponseDto] })
  async getWorklogs(@Param('productionId') productionId: string): Promise<BinderWorklogListResponseDto[]> {
    return await this.binderService.getWorklogs(productionId);
  }

  @Get(':worklogId/binder')
  async getWorklogById(@Param('productionId') productionId: string, @Param('worklogId') worklogId: string) {
    return await this.binderService.findWorklogById(worklogId);
  }
}
