import { Controller, Get, Post, Query, Body, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiConflictResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { DrawingService } from './drawing.service';
import { CreateDrawingDto, DrawingSearchDto } from 'src/common/dtos/drawing.dto';
import { multerConfig } from 'src/common/configs/multer.config';

@Controller('drawing')
export class DrawingController {
  constructor(private readonly drawingService: DrawingService) {}

  @Get()
  @ApiOperation({ summary: '도면 목록 조회' })
  async findAll(@Query() searchDto: DrawingSearchDto) {
    return this.drawingService.findAll(searchDto);
  }

  @Post()
  @ApiOperation({ summary: '새 도면 등록' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateDrawingDto })
  @ApiConflictResponse({ description: '이미 존재하는 도면 번호입니다.' })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'drawingFile', maxCount: 1 },
        { name: 'pdfFiles', maxCount: 20 },
      ],
      multerConfig,
    ),
  )
  async create(
    @Body() createDto: CreateDrawingDto,
    @UploadedFiles() files: { drawingFile?: Express.Multer.File[]; pdfFiles?: Express.Multer.File[] },
  ) {
    return this.drawingService.create(createDto, files);
  }
}
