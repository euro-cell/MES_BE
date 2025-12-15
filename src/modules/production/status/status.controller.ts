import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { StatusService } from './status.service';
import { ApiQuery } from '@nestjs/swagger';

@Controller(':productionId/status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Get()
  async getStatusData(@Param('productionId', ParseIntPipe) productionId: number) {
    return await this.statusService.getStatusData(productionId);
  }

  @Get('Electrode')
  @ApiQuery({ name: 'month', required: true, type: String, description: 'YYYY-MM 형식 (예: 2025-01)' })
  @ApiQuery({ name: 'type', required: true, enum: ['cathode', 'anode'], description: '양극재(cathode) 또는 음극재(anode)' })
  async getElectrodeStatus(
    @Param('productionId', ParseIntPipe) productionId: number,
    @Query('month') month: string,
    @Query('type') type: 'cathode' | 'anode',
  ) {
    return await this.statusService.getElectrodeStatus(productionId, month, type);
  }
}
