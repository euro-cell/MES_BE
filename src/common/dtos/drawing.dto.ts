import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { DrawingCategory } from '../enums/drawing.enum';

export class DrawingDto {
  @ApiProperty({ description: '도면 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '대분류', example: '공장', enum: DrawingCategory })
  category: DrawingCategory;

  @ApiProperty({ description: '중분류 (프로젝트명)', example: '오산' })
  projectName: string;

  @ApiProperty({ description: '소분류 (구분)', example: '1층' })
  division: string;

  @ApiProperty({ description: '도면 번호', example: 'OS-F1-001' })
  drawingNumber: string;

  @ApiPropertyOptional({ description: '도면 내용', example: '오산 공장 1층 배치도' })
  description?: string;

  @ApiProperty({ description: '현재 버전', example: 1.0 })
  currentVersion: number;
}

export class CreateDrawingDto {
  @ApiProperty({ description: '대분류', example: '공장', enum: DrawingCategory })
  @IsNotEmpty()
  @IsEnum(DrawingCategory)
  category: DrawingCategory;

  @ApiProperty({ description: '중분류 (프로젝트명)', example: '오산' })
  @IsNotEmpty()
  @IsString()
  projectName: string;

  @ApiProperty({ description: '소분류 (구분)', example: '1층' })
  @IsNotEmpty()
  @IsString()
  division: string;

  @ApiProperty({ description: '도면 번호', example: 'OS-F1-001' })
  @IsNotEmpty()
  @IsString()
  drawingNumber: string;

  @ApiPropertyOptional({ description: '도면 내용' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '버전', example: 1.0 })
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

  @ApiPropertyOptional({ type: 'string', format: 'binary', description: '도면 파일 (.dwg)' })
  drawingFile?: Express.Multer.File;

  @ApiPropertyOptional({ type: 'array', items: { type: 'string', format: 'binary' }, description: 'PDF 파일 (복수)' })
  pdfFiles?: Express.Multer.File[];
}

export class UpdateDrawingDto extends PartialType(
  OmitType(CreateDrawingDto, ['drawingNumber', 'version', 'registrationDate', 'changeNote', 'drawingFile', 'pdfFiles'] as const),
) {}

export class DrawingSearchDto {
  @ApiPropertyOptional({ description: '구분 필터', enum: DrawingCategory })
  @IsOptional()
  @IsEnum(DrawingCategory)
  category?: DrawingCategory;

  @ApiPropertyOptional({ description: '프로젝트명 검색' })
  @IsOptional()
  @IsString()
  projectName?: string;

  @ApiPropertyOptional({ description: '도면 번호 검색' })
  @IsOptional()
  @IsString()
  drawingNumber?: string;
}
