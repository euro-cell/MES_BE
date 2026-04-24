import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ProductSpecificationService } from './specification.service';
import { CreateSpecificationDto, UpdateSpecificationDto } from 'src/common/dtos/specification/specification.dto';
import { SessionAuthGuard } from 'src/common/guards/session-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { RequirePermission } from 'src/common/decorators/permission.decorator';
import { MenuName, PermissionAction } from 'src/common/enums/menu.enum';

@Controller(':projectId/specification')
@UseGuards(SessionAuthGuard, PermissionGuard)
export class ProductSpecificationController {
  constructor(private readonly productSpecificationService: ProductSpecificationService) {}

  @Post()
  @RequirePermission(MenuName.SPECIFICATION, PermissionAction.CREATE)
  async createSpecification(@Param('projectId', ParseIntPipe) projectId: number, @Body() dto: CreateSpecificationDto) {
    return await this.productSpecificationService.createSpecification(projectId, dto);
  }

  @Get()
  async findOneSpecification(@Param('projectId', ParseIntPipe) projectId: number) {
    return await this.productSpecificationService.findOneSpecification(projectId);
  }

  @Patch()
  @RequirePermission(MenuName.SPECIFICATION, PermissionAction.UPDATE)
  async updateSpecification(@Param('projectId', ParseIntPipe) projectId: number, @Body() dto: UpdateSpecificationDto) {
    return await this.productSpecificationService.updateSpecification(projectId, dto);
  }

  @Delete()
  @RequirePermission(MenuName.SPECIFICATION, PermissionAction.DELETE)
  async removeSpecification(@Param('projectId', ParseIntPipe) projectId: number) {
    return await this.productSpecificationService.removeSpecification(projectId);
  }
}
