import { Controller, Post, Body, Param } from '@nestjs/common';
import { BinderService } from './binder.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateBinderWorklogDto } from 'src/common/dtos/worklog/binder.dto';

@ApiTags('Production Worklog - Binder')
@Controller(':productionId/worklog')
export class BinderController {
  constructor(private readonly binderService: BinderService) {}

  @Post('binder')
  async createBinderWorklog(@Param('productionId') productionId: string, @Body() createBinderWorklogDto: CreateBinderWorklogDto) {
    return await this.binderService.createBinderWorklog(productionId, createBinderWorklogDto);
  }
}
