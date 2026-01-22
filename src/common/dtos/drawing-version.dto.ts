import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class DrawingVersionDto {
  @ApiProperty({ description: '버전 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '버전', example: 1.0 })
  version: number;

  @ApiPropertyOptional({ description: '도면 파일명', example: 'layout_v1.0.dwg' })
  drawingFileName: string | null;

  @ApiPropertyOptional({ description: 'PDF 파일명 목록', example: ['floor1.pdf', 'detail.pdf'] })
  pdfFileNames: string[] | null;

  @ApiProperty({ description: '등록일', example: '2024-01-15' })
  registrationDate: string;

  @ApiPropertyOptional({ description: '변경 사유' })
  changeNote: string | null;
}

export class CreateDrawingVersionDto {
  @ApiProperty({ description: '버전', example: 1.1 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  version: number;

  @ApiProperty({ description: '등록일', example: '2024-01-15' })
  @IsNotEmpty()
  @IsString()
  registrationDate: string;

  @ApiPropertyOptional({ description: '변경 사유' })
  @IsOptional()
  @IsString()
  changeNote?: string;
}
