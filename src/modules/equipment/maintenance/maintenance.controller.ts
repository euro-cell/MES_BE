import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
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
}
