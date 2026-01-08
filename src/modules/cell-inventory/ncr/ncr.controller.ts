import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NcrService } from './ncr.service';
import { NcrStatisticsResponseDto } from 'src/common/dtos/ncr-statistics.dto';

@ApiTags('Cell NCR')
@Controller()
export class NcrController {
  constructor(private readonly ncrService: NcrService) {}

  @Get('statistics')
  @ApiOperation({ summary: 'NCR 통계 조회' })
  @ApiResponse({ type: NcrStatisticsResponseDto })
  async getStatistics() {
    return await this.ncrService.getStatistics();
  }
}
