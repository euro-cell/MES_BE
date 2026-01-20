import { Body, Controller, Get, Param, ParseIntPipe, Patch, Query, Res } from '@nestjs/common';
import { StatusService } from './status.service';
import { ApiQuery, ApiProduces } from '@nestjs/swagger';
import { UpdateTargetByKeyDto } from 'src/common/dtos/production-target.dto';
import type { Response } from 'express';

@Controller(':productionId/status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Get()
  async getStatusData(@Param('productionId', ParseIntPipe) productionId: number) {
    return await this.statusService.getStatusData(productionId);
  }

  @Get('Electrode')
  @ApiQuery({ name: 'month', required: true, type: String, description: 'YYYY-MM 형식 (예: 2025-01)' })
  @ApiQuery({ name: 'type', required: true, enum: ['cathode', 'anode'], description: 'cathode 또는 anode' })
  async getElectrodeStatus(
    @Param('productionId', ParseIntPipe) productionId: number,
    @Query('month') month: string,
    @Query('type') type: 'cathode' | 'anode',
  ) {
    return await this.statusService.getElectrodeStatus(productionId, month, type);
  }

  @Get('Assembly')
  @ApiQuery({ name: 'month', required: true, type: String, description: 'YYYY-MM 형식 (예: 2025-01)' })
  async getAssemblyStatus(@Param('productionId', ParseIntPipe) productionId: number, @Query('month') month: string) {
    return await this.statusService.getAssemblyStatus(productionId, month);
  }

  @Get('Formation')
  @ApiQuery({ name: 'month', required: true, type: String, description: 'YYYY-MM 형식 (예: 2025-01)' })
  async getFormationStatus(@Param('productionId', ParseIntPipe) productionId: number, @Query('month') month: string) {
    return await this.statusService.getFormationStatus(productionId, month);
  }

  @Patch('target')
  async updateTargetStatus(@Param('productionId', ParseIntPipe) productionId: number, @Body() dto: UpdateTargetByKeyDto) {
    return await this.statusService.updateTargetStatus(productionId, dto);
  }

  @Get('progress')
  async getProgress(@Param('productionId', ParseIntPipe) productionId: number) {
    return await this.statusService.getProgress(productionId);
  }

  @Get('Electrode/export')
  @ApiProduces('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  async exportElectrodeStatus(@Param('productionId', ParseIntPipe) productionId: number, @Res() res: Response) {
    const { file, productionName } = await this.statusService.exportElectrodeStatus(productionId);
    const filename = `${productionName}_전극공정_생산현황.xlsx`;

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      'Access-Control-Expose-Headers': 'Content-Disposition',
    });

    file.getStream().pipe(res);
  }
}
