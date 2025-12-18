import { Controller, Post, Param, Query } from '@nestjs/common';
import { LotService } from './lot.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Lot 관리/검색')
@Controller(':productionId/lot')
export class LotController {
  constructor(private readonly lotService: LotService) {}

  @Post('sync')
  @ApiOperation({ summary: '데이터 갱신' })
  @ApiQuery({ name: 'process', required: true, description: '공정명 (mixing, coating, formation 등)' })
  async sync(@Param('productionId') productionId: number, @Query('process') process: string) {
    return this.lotService.sync(productionId, process);
  }
}
