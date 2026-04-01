import { Body, Controller, Delete, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ProductMaterialService } from './material.service';
import { CreateProjectMaterialDto, UpdateProjectMaterialDto } from 'src/common/dtos/project/project-material.dto';

@Controller(':projectId/material')
export class ProductMaterialController {
  constructor(private readonly productMaterialService: ProductMaterialService) {}

  @Post()
  async createMaterial(@Param('projectId', ParseIntPipe) projectId: number, @Body() dto: CreateProjectMaterialDto) {
    return await this.productMaterialService.createMaterial(projectId, dto);
  }

  // @Get()
  // async findOneMaterial(@Param('projectId', ParseIntPipe) projectId: number) {
  //   return await this.productMaterialService.findOneMaterial(projectId);
  // }

  @Patch()
  async updateMaterial(@Param('projectId', ParseIntPipe) projectId: number, @Body() dto: UpdateProjectMaterialDto) {
    return await this.productMaterialService.updateMaterial(projectId, dto);
  }

  @Delete()
  async deleteMaterial(@Param('projectId', ParseIntPipe) projectId: number) {
    return await this.productMaterialService.removeMaterial(projectId);
  }
}
