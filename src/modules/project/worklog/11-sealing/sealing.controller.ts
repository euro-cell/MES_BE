import { Controller, Post, Body, Param, Get, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { SealingService } from './sealing.service';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { CreateSealingWorklogDto, SealingWorklogListResponseDto, UpdateSealingWorklogDto } from 'src/common/dtos/worklog/11-sealing.dto';

@ApiTags('Production Worklog - Sealing')
@Controller(':projectId/worklog')
export class SealingController {
  constructor(private readonly sealingService: SealingService) {}

  @Post('sealing')
  async createSealingWorklog(@Param('projectId', ParseIntPipe) projectId: number, @Body() dto: CreateSealingWorklogDto) {
    return await this.sealingService.createSealingWorklog(projectId, dto);
  }

  @Get('sealing')
  @ApiOkResponse({ description: '작업일지-실링 목록', type: [SealingWorklogListResponseDto] })
  async getWorklogs(@Param('projectId', ParseIntPipe) projectId: number): Promise<SealingWorklogListResponseDto[]> {
    return await this.sealingService.getWorklogs(projectId);
  }

  @Get(':worklogId/sealing')
  async getWorklogById(@Param('projectId', ParseIntPipe) projectId: number, @Param('worklogId') worklogId: string) {
    return await this.sealingService.findWorklogById(worklogId);
  }

  @Patch(':worklogId/sealing')
  async updateSealingWorklog(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('worklogId') worklogId: string,
    @Body() updateSealingWorklogDto: UpdateSealingWorklogDto,
  ) {
    return await this.sealingService.updateSealingWorklog(worklogId, updateSealingWorklogDto);
  }

  @Delete(':worklogId/sealing')
  async deleteSealingWorklog(@Param('projectId', ParseIntPipe) projectId: number, @Param('worklogId') worklogId: string) {
    return await this.sealingService.deleteSealingWorklog(worklogId);
  }
}
