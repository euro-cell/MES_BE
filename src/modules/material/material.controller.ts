import { Controller, Get, Post, Patch, Delete, Body, Query, Param, ParseIntPipe, Res, StreamableFile } from '@nestjs/common';
import type { Response } from 'express';
import { MaterialService } from './material.service';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CreateMaterialDto, UpdateMaterialDto, ImportMaterialDto, ImportMaterialResultDto } from 'src/common/dtos/material.dto';
import { MaterialProcess } from 'src/common/enums/material.enum';

@Controller('material')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Get()
  @ApiQuery({ name: 'category', required: false, description: '자재 분류명' })
  async findAllMaterials(@Query('category') category?: string) {
    return this.materialService.findAllMaterials(category);
  }

  @Get('electrode')
  @ApiQuery({ name: 'isZeroStock', required: false, description: '재고 없는 자재 포함 여부 (true/false)', example: false })
  async findElectrode(@Query('isZeroStock') isZeroStock?: string) {
    const includeZero = isZeroStock === 'true';
    return this.materialService.findByElectrode(includeZero);
  }

  @Get('electrode/export')
  @ApiOperation({ summary: '전극 재고 Excel 내보내기' })
  async exportElectrode(@Res({ passthrough: true }) res: Response): Promise<StreamableFile> {
    const file = await this.materialService.exportElectrodeMaterial();
    const filename = this.materialService.getElectrodeExportFilename();

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
    });

    return file;
  }

  @Post('electrode/import')
  @ApiOperation({ summary: '전극 자재 일괄 등록/수정 (Excel 업로드)' })
  async importElectrodeMaterial(@Body() dto: ImportMaterialDto): Promise<ImportMaterialResultDto> {
    return this.materialService.importElectrodeMaterials(dto.materials);
  }

  @Get('assembly')
  @ApiQuery({ name: 'isZeroStock', required: false, description: '재고 없는 자재 포함 여부 (true/false)', example: false })
  async findByAssembly(@Query('isZeroStock') isZeroStock?: string) {
    const includeZero = isZeroStock === 'true';
    return this.materialService.findByAssembly(includeZero);
  }

  @Get('assembly/export')
  @ApiOperation({ summary: '조립 재고 Excel 내보내기' })
  async exportAssembly(@Res({ passthrough: true }) res: Response): Promise<StreamableFile> {
    const file = await this.materialService.exportAssemblyMaterial();
    const filename = this.materialService.getAssemblyExportFilename();

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
    });

    return file;
  }

  @Post('assembly/import')
  @ApiOperation({ summary: '조립 자재 일괄 등록/수정 (Excel 업로드)' })
  async importAssemblyMaterial(@Body() dto: ImportMaterialDto): Promise<ImportMaterialResultDto> {
    return this.materialService.importAssemblyMaterials(dto.materials);
  }

  @Get('production')
  findByMaterialProduction() {
    return this.materialService.findByMaterialProduction();
  }

  @Get('categories')
  getDistinctCategories() {
    return this.materialService.getDistinctCategories();
  }

  @Get('lots')
  @ApiOperation({ summary: '카테고리별 자재 LOT 목록 조회 (재고 있는 것만, 선입선출 순서)' })
  @ApiQuery({ name: 'category', required: false, description: '자재 카테고리 (예: NMP, CMC, SBR)' })
  @ApiQuery({ name: 'type', required: false, description: '자재 타입 (예: Al Foil, Cu Foil)' })
  async getLotsByCategory(@Query('category') category?: string, @Query('type') type?: string) {
    return this.materialService.getLotsByCategory(category, type);
  }

  @Post('electrode')
  async createElectrodeMaterial(@Body() dto: CreateMaterialDto) {
    return this.materialService.createElectrodeMaterial(dto);
  }

  @Patch('electrode/:id')
  async updateElectrodeMaterial(@Param('id', ParseIntPipe) id: number, @Body() updateMaterialDto: UpdateMaterialDto) {
    return this.materialService.updateElectrodeMaterial(id, updateMaterialDto);
  }

  @Delete('electrode/:id')
  @ApiQuery({ name: 'hardDelete', required: false, description: 'hardDelete 여부 (true/false)', example: false })
  async deleteElectrodeMaterial(@Param('id', ParseIntPipe) id: number, @Query('hardDelete') hardDelete?: string) {
    const isHardDelete = hardDelete === 'true';
    return this.materialService.deleteElectrodeMaterial(id, isHardDelete);
  }

  @Post('assembly')
  async createAssemblyMaterial(@Body() dto: CreateMaterialDto) {
    return this.materialService.createAssemblyMaterial(dto);
  }

  @Patch('assembly/:id')
  async updateAssemblyMaterial(@Param('id', ParseIntPipe) id: number, @Body() updateMaterialDto: UpdateMaterialDto) {
    return this.materialService.updateAssemblyMaterial(id, updateMaterialDto);
  }

  @Delete('assembly/:id')
  @ApiQuery({ name: 'hardDelete', required: false, description: 'hardDelete 여부 (true/false)', example: false })
  async deleteAssemblyMaterial(@Param('id', ParseIntPipe) id: number, @Query('hardDelete') hardDelete?: string) {
    const isHardDelete = hardDelete === 'true';
    return this.materialService.deleteAssemblyMaterial(id, isHardDelete);
  }

  @Get('history/:process')
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호 (기본값: 1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '페이지당 아이템 수 (기본값: 20)', example: 20 })
  async getMaterialHistoryByProcess(@Param('process') process: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const processEnum = process === 'electrode' ? MaterialProcess.ELECTRODE : MaterialProcess.ASSEMBLY;
    return this.materialService.getMaterialHistoryByProcess(processEnum, pageNum, limitNum);
  }
}
