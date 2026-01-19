import { Controller, Get, Patch, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { NcrService } from './ncr.service';
import { NcrStatisticsResponseDto, NcrDetailResponseDto, UpdateNcrDetailRequestDto } from 'src/common/dtos/ncr-statistics.dto';

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
  @ApiQuery({ name: 'projectNo', required: false, description: '프로젝트 번호 (optional)' })
  @ApiResponse({ type: NcrDetailResponseDto })
  async getDetail(@Query('projectName') projectName: string, @Query('projectNo') projectNo?: string) {
    return await this.ncrService.getDetail(projectName, projectNo);
  }

  @Patch('detail')
  @ApiOperation({ summary: 'NCR 세부 현황 저장 (프로젝트별)' })
  @ApiQuery({ name: 'projectNo', required: false, description: '프로젝트 번호 (optional)' })
  @ApiResponse({ description: '저장 성공', schema: { example: { message: '저장되었습니다.' } } })
  async updateDetail(@Body() dto: UpdateNcrDetailRequestDto, @Query('projectNo') projectNo?: string) {
    return await this.ncrService.updateDetail(dto, projectNo);
  }
}
