import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ProductSpecificationService } from './specification.service';
import { CreateSpecificationDto, UpdateSpecificationDto } from 'src/common/dtos/specification.dto';

@Controller(':projectId/specification')
export class ProductSpecificationController {
  constructor(private readonly productSpecificationService: ProductSpecificationService) {}

  @Post()
  async createSpecification(@Param('projectId', ParseIntPipe) productionId: number, @Body() dto: CreateSpecificationDto) {
    return await this.productSpecificationService.createSpecification(productionId, dto);
  }

  @Get()
  async findOneSpecification(@Param('projectId', ParseIntPipe) productionId: number) {
    return await this.productSpecificationService.findOneSpecification(productionId);
  }

  @Patch()
  async updateSpecification(@Param('projectId', ParseIntPipe) productionId: number, @Body() dto: UpdateSpecificationDto) {
    return await this.productSpecificationService.updateSpecification(productionId, dto);
  }
}
