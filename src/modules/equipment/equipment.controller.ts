import { Body, Controller, Post } from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { CreateEquipmentDto } from 'src/common/dtos/equipment.dto';

@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Post()
  async create(@Body() createEquipmentDto: CreateEquipmentDto) {
    return this.equipmentService.create(createEquipmentDto);
  }
}
