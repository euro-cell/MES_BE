import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { OqcService } from './oqc.service';

@ApiTags('Quality - OQC')
@Controller()
export class OqcController {
  constructor(private readonly oqcService: OqcService) {}

  @Get(':productionId/grading')
  @ApiOperation({ summary: 'Grading 데이터 목록 조회' })
  async getGradingData(@Param('productionId') productionId: number) {
    return this.oqcService.getGradingData(productionId);
  }
}
