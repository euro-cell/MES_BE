import { Controller, Post, Patch, Get, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConflictResponse, ApiResponse } from '@nestjs/swagger';
import { CellInventoryService } from './cell-inventory.service';
import {
  CreateCellInventoryDto,
  UpdateCellInventoryDto,
  ProjectStatisticsDto,
  CellInventoryResponseDto,
} from 'src/common/dtos/cell-inventory.dto';

@ApiTags('Cell Inventory')
@Controller('cell-inventory')
export class CellInventoryController {
  constructor(private readonly cellInventoryService: CellInventoryService) {}

  @Post()
  @ApiOperation({ summary: '셀 입고 등록' })
  @ApiConflictResponse({ description: '이미 입고된 셀입니다.' })
  async create(@Body() dto: CreateCellInventoryDto) {
    return this.cellInventoryService.create(dto);
  }

  @Patch()
  @ApiOperation({ summary: '셀 출고' })
  @ApiConflictResponse({ description: '이미 출고된 셀입니다.' })
  async upsert(@Body() dto: UpdateCellInventoryDto) {
    return this.cellInventoryService.upsert(dto);
  }

  @Patch('restock')
  @ApiOperation({ summary: '셀 재입고' })
  @ApiConflictResponse({ description: '출고된 이력이 없는 셀입니다.' })
  async restock(@Body() dto: CreateCellInventoryDto) {
    return this.cellInventoryService.restock(dto);
  }

  @Get('statistics')
  @ApiOperation({ summary: '셀 입/출고 현황(프로젝트별)' })
  @ApiResponse({ type: [ProjectStatisticsDto] })
  async getStatistics() {
    return this.cellInventoryService.getStatistics();
  }

  @Get('storage-usage')
  @ApiOperation({ summary: 'RACK 보관 현황' })
  async getStorageUsage() {
    return await this.cellInventoryService.getStorageUsage();
  }

  @Get('project')
  @ApiOperation({ summary: '프로젝트별 셀 데이터 조회' })
  @ApiResponse({ type: [CellInventoryResponseDto] })
  async getProjectCells(@Query('name') projectName: string) {
    return await this.cellInventoryService.getProjectCells(projectName);
  }
}
