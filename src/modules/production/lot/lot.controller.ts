import { Controller, Post, Param, Query, Get } from '@nestjs/common';
import { LotService } from './lot.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MixingService } from './electrode/mixing.service';

@ApiTags('Lot 관리/검색')
@Controller(':productionId/lot')
export class LotController {
  constructor(
    private readonly lotService: LotService,
    private readonly mixingService: MixingService,
  ) {}

  @Post('sync')
  @ApiOperation({ summary: '데이터 갱신' })
  @ApiQuery({ name: 'process', required: true, description: '공정명 (mixing, coating, formation 등)' })
  async sync(@Param('productionId') productionId: number, @Query('process') process: string) {
    return this.lotService.sync(productionId, process);
  }

  @Get('mixing')
  async getMixingLots(@Param('productionId') productionId: number) {
    return this.mixingService.getMixingLots(productionId);
  }
}
