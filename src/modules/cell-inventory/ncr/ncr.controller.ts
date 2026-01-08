import { Controller } from '@nestjs/common';
import { NcrService } from './ncr.service';

@Controller('ncr')
export class NcrController {
  constructor(private readonly ncrService: NcrService) {}
}
