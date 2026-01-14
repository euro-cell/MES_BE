import { Body, Controller, Get, Post } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceDto } from 'src/common/dtos/maintenance.dto';

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
}
