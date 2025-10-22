import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ProductionService } from './production.service';

@Controller('production')
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Get()
  async getProductions() {
    return await this.productionService.findAll();
  }

  @Post()
  async createProduction(@Body() body) {
    await this.productionService.create(body);
  }

  @Delete(':id')
  async deleteProduction(@Param('id', ParseIntPipe) id: number) {
    return this.productionService.remove(id);
  }
}
