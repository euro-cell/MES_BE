import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Res, StreamableFile, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ApiOperation } from '@nestjs/swagger';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceDto, UpdateMaintenanceDto } from '../../../common/dtos/equipment/maintenance.dto';
import { SessionAuthGuard } from '../../../common/guards/session-auth.guard';
import { PermissionGuard } from '../../../common/guards/permission.guard';
import { RequirePermission } from '../../../common/decorators/permission.decorator';
import { MenuName, PermissionAction } from '../../../common/enums/menu.enum';

@Controller()
@UseGuards(SessionAuthGuard, PermissionGuard)
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get()
  async findAll(@Query('equipmentId', new ParseIntPipe({ optional: true })) equipmentId?: number) {
    return this.maintenanceService.findAll(equipmentId);
  }

  @Post()
  @RequirePermission(MenuName.EQUIPMENT_MAINTENANCE, PermissionAction.CREATE)
  async create(@Body() createMaintenanceDto: CreateMaintenanceDto) {
    return this.maintenanceService.create(createMaintenanceDto);
  }

  @Patch(':id')
  @RequirePermission(MenuName.EQUIPMENT_MAINTENANCE, PermissionAction.UPDATE)
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateMaintenanceDto: UpdateMaintenanceDto) {
    return this.maintenanceService.update(id, updateMaintenanceDto);
  }

  @Delete(':id')
  @RequirePermission(MenuName.EQUIPMENT_MAINTENANCE, PermissionAction.DELETE)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.maintenanceService.remove(id);
  }

  @Get('export')
  @ApiOperation({ summary: '유지보수 목록 Excel 내보내기' })
  async exportMaintenance(@Res({ passthrough: true }) res: Response): Promise<StreamableFile> {
    const file = await this.maintenanceService.exportMaintenance();
    const filename = this.maintenanceService.getMaintenanceExportFilename();

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
    });

    return file;
  }
}
