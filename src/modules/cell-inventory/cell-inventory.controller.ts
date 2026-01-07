import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConflictResponse } from '@nestjs/swagger';
import { CellInventoryService } from './cell-inventory.service';
import { CreateCellInventoryDto } from 'src/common/dtos/cell-inventory.dto';

@ApiTags('Cell Inventory')
@Controller('cell-inventory')
export class CellInventoryController {
  constructor(private readonly cellInventoryService: CellInventoryService) {}

  @Post()
  @ApiOperation({ summary: '셀 입고 등록' })
  @ApiConflictResponse({ description: '이미 존재하는 셀입니다.' })
  async create(@Body() dto: CreateCellInventoryDto) {
    return this.cellInventoryService.create(dto);
  }
}
