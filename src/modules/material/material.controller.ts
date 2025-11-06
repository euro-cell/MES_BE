import { Controller, Get, Query } from '@nestjs/common';
import { MaterialService } from './material.service';
import { ApiQuery } from '@nestjs/swagger';

@Controller('material')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Get()
  @ApiQuery({ name: 'category', required: false, description: '자재 분류명' })
  async findAllMaterials(@Query('category') category?: string) {
    return this.materialService.findAllMaterials(category);
  }

  @Get('electrode')
  findElectrode() {
    return this.materialService.findByElectrode();
  }

  @Get('assembly')
  findByAssembly() {
    return this.materialService.findByAssembly();
  }

  @Get('production')
  findByMaterialProduction() {
    return this.materialService.findByMaterialProduction();
  }

  @Get('categories')
  getDistinctCategories() {
    return this.materialService.getDistinctCategories();
  }
}
