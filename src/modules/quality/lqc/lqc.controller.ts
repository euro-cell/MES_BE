import { Controller } from '@nestjs/common';
import { LqcService } from './lqc.service';

@Controller()
export class LqcController {
  constructor(private readonly lqcService: LqcService) {}
}
