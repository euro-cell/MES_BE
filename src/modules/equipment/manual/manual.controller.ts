import { Controller, Get, Post, Delete, Param, Query, ParseIntPipe, UploadedFile, UseInterceptors, Body, Res, StreamableFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { multerConfig } from 'src/common/configs/multer.config';
import { ManualService } from './manual.service';
import { CreateManualDto, UploadManualDto } from 'src/common/dtos/equipment/equipment-manual.dto';

@ApiTags('Equipment - Manual')
@Controller()
export class ManualController {
  constructor(private readonly manualService: ManualService) {}

  @Get()
  @ApiOperation({ summary: '매뉴얼 목록 조회' })
  @ApiQuery({ name: 'equipmentId', required: true, description: '설비 ID' })
  async findAll(@Query('equipmentId', ParseIntPipe) equipmentId: number) {
    return this.manualService.findByEquipmentId(equipmentId);
  }

  @Post()
  @ApiOperation({ summary: '매뉴얼 파일 업로드' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadManualDto })
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async upload(@Body() dto: CreateManualDto, @UploadedFile() file: Express.Multer.File) {
    return this.manualService.upload(dto, file);
  }

  @Delete(':id')
  @ApiOperation({ summary: '매뉴얼 삭제' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.manualService.remove(id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: '매뉴얼 파일 다운로드' })
  async download(@Param('id', ParseIntPipe) id: number, @Res({ passthrough: true }) res: Response): Promise<StreamableFile> {
    const { stream, fileName } = await this.manualService.download(id);

    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    });

    return stream;
  }
}
