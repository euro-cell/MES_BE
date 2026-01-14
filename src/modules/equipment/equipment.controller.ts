import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
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
}
