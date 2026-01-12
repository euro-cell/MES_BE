import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { NcrService } from './ncr.service';
import { NcrStatisticsResponseDto, NcrDetailResponseDto } from 'src/common/dtos/ncr-statistics.dto';

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

  @Get('detail')
  @ApiOperation({ summary: 'NCR 세부 현황 조회 (프로젝트별)' })
  @ApiQuery({ name: 'projectName', required: true, description: '프로젝트명' })
  @ApiResponse({ type: NcrDetailResponseDto })
  async getDetail(@Query('projectName') projectName: string) {
    return await this.ncrService.getDetail(projectName);
  }
}
