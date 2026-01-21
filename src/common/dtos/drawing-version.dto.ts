import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class DrawingVersionDto {
  @ApiProperty({ description: '버전 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '도면 ID', example: 1 })
  drawingId: number;

  @ApiProperty({ description: '버전', example: '1' })
  version: string;

  @ApiProperty({ description: '도면 파일 경로' })
  drawingFilePath: string;

  @ApiProperty({ description: '도면 파일명' })
  drawingFileName: string;

  @ApiPropertyOptional({ description: 'PDF 파일 경로' })
  pdfFilePath?: string;

  @ApiPropertyOptional({ description: 'PDF 파일명' })
  pdfFileName?: string;

  @ApiProperty({ description: '등록일', example: '2024-01-15' })
  registrationDate: Date;

  @ApiPropertyOptional({ description: '변경 사항 메모' })
  changeNote?: string;
}

export class CreateDrawingVersionDto {
  @ApiProperty({ description: '버전', example: '1.1' })
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
}
