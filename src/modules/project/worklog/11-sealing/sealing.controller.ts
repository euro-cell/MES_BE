import { Controller, Post, Body, Param, Get, Patch, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { SealingService } from './sealing.service';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { CreateSealingWorklogDto, SealingWorklogListResponseDto, UpdateSealingWorklogDto } from 'src/common/dtos/worklog/11-sealing.dto';
import { SessionAuthGuard } from 'src/common/guards/session-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { RequirePermission } from 'src/common/decorators/permission.decorator';
import { MenuName, PermissionAction } from 'src/common/enums/menu.enum';

@ApiTags('Production Worklog - Sealing')
@Controller(':projectId/worklog')
@UseGuards(SessionAuthGuard, PermissionGuard)
export class SealingController {
  constructor(private readonly sealingService: SealingService) {}

  @Post('sealing')
  @RequirePermission(MenuName.WORKLOG, PermissionAction.CREATE)
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
  @RequirePermission(MenuName.WORKLOG, PermissionAction.UPDATE)
  async updateSealingWorklog(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('worklogId') worklogId: string,
    @Body() updateSealingWorklogDto: UpdateSealingWorklogDto,
  ) {
    return await this.sealingService.updateSealingWorklog(worklogId, updateSealingWorklogDto);
  }

  @Delete(':worklogId/sealing')
  @RequirePermission(MenuName.WORKLOG, PermissionAction.DELETE)
  async deleteSealingWorklog(@Param('projectId', ParseIntPipe) projectId: number, @Param('worklogId') worklogId: string) {
    return await this.sealingService.deleteSealingWorklog(worklogId);
  }
}
