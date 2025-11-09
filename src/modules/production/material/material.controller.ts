import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ProductMaterialService } from './material.service';
import { CreateMaterialDto } from 'src/common/dtos/production-material.dto';

@Controller(':productionId/material')
export class ProductMaterialController {
  constructor(private readonly productMaterialService: ProductMaterialService) {}

  @Post()
  async createMaterial(@Param('productionId', ParseIntPipe) productionId: number, @Body() dto: CreateMaterialDto) {
    return await this.productMaterialService.createMaterial(productionId, dto);
  }

  @Get()
  async findOneMaterial(@Param('productionId', ParseIntPipe) productionId: number) {
    return await this.productMaterialService.findOneMaterial(productionId);
  }
}
