import { Controller } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';

@Controller()
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}
}
