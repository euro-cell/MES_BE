import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Res, StreamableFile } from '@nestjs/common';
import type { Response } from 'express';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { EquipmentService } from './equipment.service';
import { categoryMap, CreateEquipmentDto, EquipmentSearchDto, UpdateEquipmentDto } from 'src/common/dtos/equipment.dto';

@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Get()
  async findByCategory(@Query() query: EquipmentSearchDto) {
    const category = categoryMap[query.category];
    return this.equipmentService.findByCategory(category);
  }

  @Get('mixers')
  async findMixersByCategory(@Query() query: EquipmentSearchDto) {
    const category = categoryMap[query.category];
    return this.equipmentService.findMixersByCategory(category);
  }

  @Post()
  async create(@Body() createEquipmentDto: CreateEquipmentDto) {
    return this.equipmentService.create(createEquipmentDto);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateEquipmentDto: UpdateEquipmentDto) {
    return this.equipmentService.update(id, updateEquipmentDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.equipmentService.remove(id);
  }

  @Get('export')
  @ApiOperation({ summary: '설비 목록 Excel 내보내기' })
  @ApiQuery({
    name: 'category',
    enum: ['production', 'development', 'measurement'],
    description: '설비분류',
  })
  async exportEquipment(@Query() query: EquipmentSearchDto, @Res({ passthrough: true }) res: Response): Promise<StreamableFile> {
    const category = categoryMap[query.category];
    const file = await this.equipmentService.exportEquipmentByCategory(category);
    const filename = this.equipmentService.getEquipmentExportFilename(category);

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
    });

    return file;
  }
}
