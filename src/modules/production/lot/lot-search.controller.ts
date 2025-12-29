import { Controller, Query, Get, BadRequestException } from '@nestjs/common';
import { LotService } from './lot.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Lot 검색')
@Controller('lot')
export class LotSearchController {
  constructor(private readonly lotService: LotService) {}

  @Get('search')
  @ApiOperation({ summary: 'Lot 검색' })
  @ApiQuery({ name: 'lot', required: true, description: '최종 lot' })
  async search(@Query('lot') lot: string) {
    if (!lot) {
      throw new BadRequestException('lot 파라미터가 필요합니다.');
    }

    const [processResult, materialResult] = await Promise.all([
      this.lotService.searchProcessLots(lot),
      this.lotService.searchRawMaterialLots(lot),
    ]);

    return {
      projectId: processResult.projectId,
      projectName: processResult.projectName,
      processLots: processResult.processLots,
      rawMaterialLots: materialResult.rawMaterialLots,
    };
  }
}
