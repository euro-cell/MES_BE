import { Controller, Post, Body, Param, Get, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { FormingService } from './forming.service';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { CreateFormingWorklogDto, FormingWorklogListResponseDto, UpdateFormingWorklogDto } from 'src/common/dtos/worklog/08-forming.dto';

@ApiTags('Production Worklog - Forming')
@Controller(':productionId/worklog')
export class FormingController {
  constructor(private readonly formingService: FormingService) {}

  @Post('forming')
  async createFormingWorklog(@Param('productionId', ParseIntPipe) productionId: number, @Body() dto: CreateFormingWorklogDto) {
    return await this.formingService.createFormingWorklog(productionId, dto);
  }

  @Get('forming')
  @ApiOkResponse({ description: '작업일지-포밍 목록', type: [FormingWorklogListResponseDto] })
  async getWorklogs(@Param('productionId', ParseIntPipe) productionId: number): Promise<FormingWorklogListResponseDto[]> {
    return await this.formingService.getWorklogs(productionId);
  }

  @Get(':worklogId/forming')
  async getWorklogById(@Param('productionId', ParseIntPipe) productionId: number, @Param('worklogId') worklogId: string) {
    return await this.formingService.findWorklogById(worklogId);
  }

  @Patch(':worklogId/forming')
  async updateFormingWorklog(
    @Param('productionId', ParseIntPipe) productionId: number,
    @Param('worklogId') worklogId: string,
    @Body() updateFormingWorklogDto: UpdateFormingWorklogDto,
  ) {
    return await this.formingService.updateFormingWorklog(worklogId, updateFormingWorklogDto);
  }

  @Delete(':worklogId/forming')
  async deleteFormingWorklog(@Param('productionId', ParseIntPipe) productionId: number, @Param('worklogId') worklogId: string) {
    return await this.formingService.deleteFormingWorklog(worklogId);
  }
}
