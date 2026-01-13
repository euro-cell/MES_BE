import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { DrawingService } from './drawing.service';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

@Controller('drawing')
export class DrawingController {
  constructor(private readonly drawingService: DrawingService) {}

  @Get(':category/:location/:floor')
  @ApiOperation({ summary: '도면 파일 다운로드' })
  @ApiParam({ name: 'category', description: '도면 카테고리 (예: factory)' })
  @ApiParam({ name: 'location', description: '위치 (예: osan)' })
  @ApiParam({ name: 'floor', description: '층 (예: floor1, floor2)' })
  @ApiOkResponse({ description: '도면 파일 다운로드' })
  @ApiNotFoundResponse({ description: '도면 파일을 찾을 수 없습니다.' })
  async getDrawing(
    @Res() res: Response,
    @Param('category') category: string,
    @Param('location') location: string,
    @Param('floor') floor: string,
  ) {
    return res.download(
      await this.drawingService.getDrawingFilePath(category, location, floor),
    );
  }
}
