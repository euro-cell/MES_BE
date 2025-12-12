import { Controller } from '@nestjs/common';
import { StatusService } from './status.service';

@Controller(':productionId/status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}
}
