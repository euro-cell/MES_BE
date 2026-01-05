import { Controller, Get, Post, Patch, Body, Query, Param, ParseIntPipe } from '@nestjs/common';
import { MaterialService } from './material.service';
import { ApiQuery } from '@nestjs/swagger';
import { CreateMaterialDto, UpdateMaterialDto } from 'src/common/dtos/material.dto';

@Controller('material')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Get()
  @ApiQuery({ name: 'category', required: false, description: '자재 분류명' })
  async findAllMaterials(@Query('category') category?: string) {
    return this.materialService.findAllMaterials(category);
  }

  @Get('electrode')
  @ApiQuery({ name: 'isZeroStock', required: false, description: '재고 없는 자재 포함 여부 (true/false)', example: false })
  async findElectrode(@Query('isZeroStock') isZeroStock?: string) {
    const includeZero = isZeroStock === 'true';
    return this.materialService.findByElectrode(includeZero);
  }

  @Get('assembly')
  @ApiQuery({ name: 'isZeroStock', required: false, description: '재고 없는 자재 포함 여부 (true/false)', example: false })
  async findByAssembly(@Query('isZeroStock') isZeroStock?: string) {
    const includeZero = isZeroStock === 'true';
    return this.materialService.findByAssembly(includeZero);
  }

  @Get('production')
  findByMaterialProduction() {
    return this.materialService.findByMaterialProduction();
  }

  @Get('categories')
  getDistinctCategories() {
    return this.materialService.getDistinctCategories();
  }

  @Post('electrode')
  async createElectrodeMaterial(@Body() dto: CreateMaterialDto) {
    return this.materialService.createElectrodeMaterial(dto);
  }

  @Patch('electrode/:id')
  async updateElectrodeMaterial(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMaterialDto: UpdateMaterialDto,
  ) {
    return this.materialService.updateElectrodeMaterial(id, updateMaterialDto);
  }
}
