import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { categoryMap, CreateEquipmentDto, EquipmentSearchDto } from 'src/common/dtos/equipment.dto';

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
}
