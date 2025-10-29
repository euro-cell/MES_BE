import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { SpecificationService } from './specification.service';
import { CreateBatteryDesignDto } from 'src/common/dtos/specification.dto';

@Controller('specification')
export class SpecificationController {
  constructor(private readonly specificationService: SpecificationService) {}

  @Post(':productionId')
  async createSpecification(@Param('productionId', ParseIntPipe) productionId: number, @Body() dto: CreateBatteryDesignDto) {
    return this.specificationService.createSpecification(productionId, dto);
  }

  @Get(':productionId')
  async findSpecification(@Param('productionId', ParseIntPipe) productionId: number) {
    return this.specificationService.findSpecification(productionId);
  }

  @Delete(':productionId')
  async softDeleteSpecification(@Param('productionId', ParseIntPipe) productionId: number) {
    return this.specificationService.softDeleteSpecification(productionId);
  }
}
