import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { StatusService } from './status.service';

@Controller(':productionId/status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Get()
  async getStatusData(@Param('productionId', ParseIntPipe) productionId: number) {
    return await this.statusService.getStatusData(productionId);
  }
}
