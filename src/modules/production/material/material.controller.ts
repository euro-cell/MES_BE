import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ProductMaterialService } from './material.service';
import { CreateMaterialDto } from 'src/common/dtos/production-material.dto';

@Controller(':projectId/material')
export class ProductMaterialController {
  constructor(private readonly productMaterialService: ProductMaterialService) {}

  @Post()
  async createMaterial(@Param('projectId', ParseIntPipe) productionId: number, @Body() dto: CreateMaterialDto) {
    return await this.productMaterialService.createMaterial(productionId, dto);
  }
}
