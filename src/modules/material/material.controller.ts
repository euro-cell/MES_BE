import { Controller, Get } from '@nestjs/common';
import { MaterialService } from './material.service';

@Controller('material')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Get()
  async findAllMaterials() {
    return this.materialService.findAllMaterials();
  }

  @Get('electrode')
  findElectrode() {
    return this.materialService.findByElectrode();
  }
}
