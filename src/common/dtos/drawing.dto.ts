import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { DrawingCategory } from '../enums/drawing.enum';

export class DrawingDto {
  @ApiProperty({ description: '도면 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '구분', example: '제품', enum: DrawingCategory })
  category: DrawingCategory;

  @ApiProperty({ description: '프로젝트명', example: '2024년 신규 배터리 개발' })
  projectName: string;

  @ApiProperty({ description: '도면 번호', example: 'DWG-2024-001' })
  drawingNumber: string;

  @ApiPropertyOptional({ description: '도면 내용', example: '양극재 믹싱 공정 설계도' })
  description?: string;

  @ApiProperty({ description: '현재 버전', example: '1' })
  currentVersion: string;
}

export class CreateDrawingDto {
  @ApiProperty({ description: '구분', example: '제품', enum: DrawingCategory })
  @IsNotEmpty()
  @IsEnum(DrawingCategory)
  category: DrawingCategory;

  @ApiProperty({ description: '프로젝트명', example: '2024년 신규 배터리 개발' })
  @IsNotEmpty()
  @IsString()
  projectName: string;

  @ApiProperty({ description: '도면 번호', example: 'DWG-2024-001' })
  @IsNotEmpty()
  @IsString()
  drawingNumber: string;

  @ApiPropertyOptional({ description: '도면 내용' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '버전', example: '1' })
  @IsNotEmpty()
  @IsString()
  version: string;

  @ApiProperty({ description: '등록일', example: '2024-01-15' })
  @IsNotEmpty()
  @IsString()
  registrationDate: string;

  @ApiPropertyOptional({ description: '변경 사항 메모' })
  @IsOptional()
  @IsString()
  changeNote?: string;

  @ApiProperty({ type: 'string', format: 'binary', description: '도면 파일 (dwg, dxf)' })
  drawingFile: Express.Multer.File;

  @ApiPropertyOptional({ type: 'string', format: 'binary', description: 'PDF 파일' })
  pdfFile?: Express.Multer.File;
}

export class UpdateDrawingDto extends PartialType(
  OmitType(CreateDrawingDto, ['drawingNumber', 'version', 'registrationDate', 'changeNote'] as const),
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
