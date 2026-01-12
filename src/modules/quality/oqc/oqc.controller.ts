import { Controller } from '@nestjs/common';
import { OqcService } from './oqc.service';

@Controller('oqc')
export class OqcController {
  constructor(private readonly oqcService: OqcService) {}
}
