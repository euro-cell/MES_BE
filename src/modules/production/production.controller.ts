import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ProductionService } from './production.service';
import { CreateProductionDto } from 'src/common/dtos/production.dto';

@Controller('production')
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Get()
  async getProductions() {
    return await this.productionService.findAll();
  }

  @Post()
  async createProduction(@Body() dto: CreateProductionDto) {
    await this.productionService.create(dto);
  }

  @Delete(':id')
  async deleteProduction(@Param('id', ParseIntPipe) id: number) {
    return this.productionService.remove(id);
  }
}
