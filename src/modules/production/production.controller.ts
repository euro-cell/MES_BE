import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ProductionService } from './production.service';
import { CreateProductionDto, UpdateProductionDto } from 'src/common/dtos/production.dto';

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

  @Patch(':id')
  async updateProduction(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductionDto) {
    return this.productionService.update(id, dto);
  }

  @Delete(':id')
  async deleteProduction(@Param('id', ParseIntPipe) id: number) {
    return this.productionService.remove(id);
  }

  @Get('specification')
  async getSpecificationSummary() {
    return await this.productionService.getSpecificationSummary();
  }
}
