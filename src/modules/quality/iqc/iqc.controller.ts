import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IqcService } from './iqc.service';
import { CreateIQCSummaryDto, UpdateIQCSummaryDto, CreateIQCListItemDto, UpdateIQCListItemDto } from 'src/common/dtos/iqc-summary.dto';

@ApiTags('Quality - IQC')
@Controller()
export class IqcController {
  constructor(private readonly iqcService: IqcService) {}

  @Get(':productionId/summary')
  @ApiOperation({
    summary: 'IQC Summary 조회',
    description: '부적합 수는 각 검사 데이터 저장 시 자동으로 계산됩니다.',
  })
  async getSummary(@Param('productionId') productionId: number) {
    return this.iqcService.getSummary(productionId);
  }

  @Post(':productionId/summary')
  @ApiOperation({
    summary: 'IQC Summary 저장 (프로젝트 개요 및 특이사항만 수정 가능)',
    description: '부적합 수는 각 검사 데이터에서 자동으로 계산되므로 수동 입력 불가',
  })
  async upsertSummary(@Param('productionId') productionId: number, @Body() dto: CreateIQCSummaryDto | UpdateIQCSummaryDto) {
    return this.iqcService.upsertSummary(productionId, dto);
  }

  @Get(':productionId/list')
  @ApiOperation({ summary: 'IQC List 조회' })
  async getListItems(@Param('productionId') productionId: number) {
    return this.iqcService.getListItems(productionId);
  }

  @Post(':productionId/list')
  @ApiOperation({ summary: 'IQC List 항목 추가' })
  async createListItem(@Param('productionId') productionId: number, @Body() dto: CreateIQCListItemDto) {
    return this.iqcService.createListItem(productionId, dto);
  }

  @Put('list/:itemId')
  @ApiOperation({ summary: 'IQC List 항목 수정' })
  async updateListItem(@Param('itemId') itemId: number, @Body() dto: UpdateIQCListItemDto) {
    return this.iqcService.updateListItem(itemId, dto);
  }

  @Delete('list/:itemId')
  @ApiOperation({ summary: 'IQC List 항목 삭제' })
  async deleteListItem(@Param('itemId') itemId: number) {
    return this.iqcService.deleteListItem(itemId);
  }
}
