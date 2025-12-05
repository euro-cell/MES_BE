import { Controller } from '@nestjs/common';
import { WorklogService } from './worklog.service';

@Controller()
export class WorklogController {
  constructor(private readonly worklogService: WorklogService) {}
}
