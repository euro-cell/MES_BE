import { Controller, Get } from '@nestjs/common';
import { LotService } from './lot.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Lot 관리/검색')
@Controller(':productionId/lot')
export class LotController {
  constructor(private readonly lotService: LotService) {}
}
