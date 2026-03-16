import { Controller, Get, Post, Delete, Param, Query, ParseIntPipe, UploadedFile, UseInterceptors, Body, Res, StreamableFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { multerConfig } from 'src/common/configs/multer.config';
import { CoaService } from './coa.service';
import { CreateCoaDto, UploadCoaDto } from 'src/common/dtos/coa.dto';

@ApiTags('Material - CoA')
@Controller()
export class CoaController {
  constructor(private readonly coaService: CoaService) {}

  @Get()
  @ApiOperation({ summary: 'CoA 목록 조회' })
  @ApiQuery({ name: 'materialId', required: true, description: '자재 ID' })
  async findAll(@Query('materialId', ParseIntPipe) materialId: number) {
    return this.coaService.findByMaterialId(materialId);
  }

  @Post()
  @ApiOperation({ summary: 'CoA 파일 업로드' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadCoaDto })
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async upload(@Body() dto: CreateCoaDto, @UploadedFile() file: Express.Multer.File) {
    return this.coaService.upload(dto, file);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'CoA 삭제' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.coaService.remove(id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'CoA 파일 다운로드' })
  async download(@Param('id', ParseIntPipe) id: number, @Res({ passthrough: true }) res: Response): Promise<StreamableFile> {
    const { stream, fileName } = await this.coaService.download(id);

    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    });

    return stream;
  }
}
