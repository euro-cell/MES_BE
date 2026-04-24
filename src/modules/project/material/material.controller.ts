import { Body, Controller, Delete, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ProductMaterialService } from './material.service';
import { CreateProjectMaterialDto, UpdateProjectMaterialDto } from 'src/common/dtos/project/project-material.dto';
import { SessionAuthGuard } from 'src/common/guards/session-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { RequirePermission } from 'src/common/decorators/permission.decorator';
import { MenuName, PermissionAction } from 'src/common/enums/menu.enum';

@Controller(':projectId/material')
@UseGuards(SessionAuthGuard, PermissionGuard)
export class ProductMaterialController {
  constructor(private readonly productMaterialService: ProductMaterialService) {}

  @Post()
  @RequirePermission(MenuName.SPECIFICATION, PermissionAction.CREATE)
  async createMaterial(@Param('projectId', ParseIntPipe) projectId: number, @Body() dto: CreateProjectMaterialDto) {
    return await this.productMaterialService.createMaterial(projectId, dto);
  }

  // @Get()
  // async findOneMaterial(@Param('projectId', ParseIntPipe) projectId: number) {
  //   return await this.productMaterialService.findOneMaterial(projectId);
  // }

  @Patch()
  @RequirePermission(MenuName.SPECIFICATION, PermissionAction.UPDATE)
  async updateMaterial(@Param('projectId', ParseIntPipe) projectId: number, @Body() dto: UpdateProjectMaterialDto) {
    return await this.productMaterialService.updateMaterial(projectId, dto);
  }

  @Delete()
  @RequirePermission(MenuName.SPECIFICATION, PermissionAction.DELETE)
  async deleteMaterial(@Param('projectId', ParseIntPipe) projectId: number) {
    return await this.productMaterialService.removeMaterial(projectId);
  }
}
