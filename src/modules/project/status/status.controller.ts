import { Body, Controller, Get, Param, ParseIntPipe, Patch, Query, Res, UseGuards } from '@nestjs/common';
import { StatusService } from './status.service';
import { ApiQuery, ApiProduces } from '@nestjs/swagger';
import { UpdateTargetByKeyDto } from 'src/common/dtos/project/project-target.dto';
import type { Response } from 'express';
import { SessionAuthGuard } from 'src/common/guards/session-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { RequirePermission } from 'src/common/decorators/permission.decorator';
import { MenuName, PermissionAction } from 'src/common/enums/menu.enum';

@Controller(':projectId/status')
@UseGuards(SessionAuthGuard, PermissionGuard)
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Get()
  async getStatusData(@Param('projectId', ParseIntPipe) projectId: number) {
    return await this.statusService.getStatusData(projectId);
  }

  @Get('Electrode')
  @ApiQuery({ name: 'month', required: true, type: String, description: 'YYYY-MM 형식 (예: 2025-01)' })
  @ApiQuery({ name: 'type', required: true, enum: ['cathode', 'anode'], description: 'cathode 또는 anode' })
  async getElectrodeStatus(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Query('month') month: string,
    @Query('type') type: 'cathode' | 'anode',
  ) {
    return await this.statusService.getElectrodeStatus(projectId, month, type);
  }

  @Get('Assembly')
  @ApiQuery({ name: 'month', required: true, type: String, description: 'YYYY-MM 형식 (예: 2025-01)' })
  async getAssemblyStatus(@Param('projectId', ParseIntPipe) projectId: number, @Query('month') month: string) {
    return await this.statusService.getAssemblyStatus(projectId, month);
  }

  @Get('Formation')
  @ApiQuery({ name: 'month', required: true, type: String, description: 'YYYY-MM 형식 (예: 2025-01)' })
  async getFormationStatus(@Param('projectId', ParseIntPipe) projectId: number, @Query('month') month: string) {
    return await this.statusService.getFormationStatus(projectId, month);
  }

  @Patch('target')
  @RequirePermission(MenuName.PRODUCTION_STATUS, PermissionAction.UPDATE)
  async updateTargetStatus(@Param('projectId', ParseIntPipe) projectId: number, @Body() dto: UpdateTargetByKeyDto) {
    return await this.statusService.updateTargetStatus(projectId, dto);
  }

  @Get('progress')
  async getProgress(@Param('projectId', ParseIntPipe) projectId: number) {
    return await this.statusService.getProgress(projectId);
  }

  @Get('Electrode/export')
  @ApiProduces('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  async exportElectrodeStatus(@Param('projectId', ParseIntPipe) projectId: number, @Res() res: Response) {
    const { file, productionName } = await this.statusService.exportElectrodeStatus(projectId);
    const filename = `${productionName}_전극공정_생산현황.xlsx`;

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      'Access-Control-Expose-Headers': 'Content-Disposition',
    });

    file.getStream().pipe(res);
  }

  @Get('Assembly/export')
  @ApiProduces('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  async exportAssemblyStatus(@Param('projectId', ParseIntPipe) projectId: number, @Res() res: Response) {
    const { file, productionName } = await this.statusService.exportAssemblyStatus(projectId);
    const filename = `${productionName}_조립공정_생산현황.xlsx`;

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      'Access-Control-Expose-Headers': 'Content-Disposition',
    });

    file.getStream().pipe(res);
  }

  @Get('Formation/export')
  @ApiProduces('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  async exportFormationStatus(@Param('projectId', ParseIntPipe) projectId: number, @Res() res: Response) {
    const { file, productionName } = await this.statusService.exportFormationStatus(projectId);
    const filename = `${productionName}_화성공정_생산현황.xlsx`;

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      'Access-Control-Expose-Headers': 'Content-Disposition',
    });

    file.getStream().pipe(res);
  }
}
