import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Res, StreamableFile } from '@nestjs/common';
import type { Response } from 'express';
import { ApiOperation } from '@nestjs/swagger';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceDto, UpdateMaintenanceDto } from 'src/common/dtos/maintenance.dto';

@Controller()
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get()
  async findAll() {
    return this.maintenanceService.findAll();
  }

  @Post()
  async create(@Body() createMaintenanceDto: CreateMaintenanceDto) {
    return this.maintenanceService.create(createMaintenanceDto);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateMaintenanceDto: UpdateMaintenanceDto) {
    return this.maintenanceService.update(id, updateMaintenanceDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.maintenanceService.remove(id);
  }

  @Get('export')
  @ApiOperation({ summary: '유지보수 목록 Excel 내보내기' })
  async exportMaintenance(
    @Res({ passthrough: true }) res: Response
  ): Promise<StreamableFile> {
    const file = await this.maintenanceService.exportMaintenance();
    const filename = this.maintenanceService.getMaintenanceExportFilename();

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
    });

    return file;
  }
}
