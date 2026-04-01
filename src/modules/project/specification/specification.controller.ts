import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ProductSpecificationService } from './specification.service';
import { CreateSpecificationDto, UpdateSpecificationDto } from 'src/common/dtos/specification/specification.dto';

@Controller(':projectId/specification')
export class ProductSpecificationController {
  constructor(private readonly productSpecificationService: ProductSpecificationService) {}

  @Post()
  async createSpecification(@Param('projectId', ParseIntPipe) projectId: number, @Body() dto: CreateSpecificationDto) {
    return await this.productSpecificationService.createSpecification(projectId, dto);
  }

  @Get()
  async findOneSpecification(@Param('projectId', ParseIntPipe) projectId: number) {
    return await this.productSpecificationService.findOneSpecification(projectId);
  }

  @Patch()
  async updateSpecification(@Param('projectId', ParseIntPipe) projectId: number, @Body() dto: UpdateSpecificationDto) {
    return await this.productSpecificationService.updateSpecification(projectId, dto);
  }

  @Delete()
  async removeSpecification(@Param('projectId', ParseIntPipe) projectId: number) {
    return await this.productSpecificationService.removeSpecification(projectId);
  }
}
