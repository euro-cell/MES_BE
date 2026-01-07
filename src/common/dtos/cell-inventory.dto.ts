import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsDateString, IsOptional } from 'class-validator';
import { CellGrade } from '../enums/cell-inventory.enum';

export class CellInventoryDto {
  @ApiProperty({ description: '셀 재고 ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Lot No', example: 'LOT-2025-001' })
  @IsNotEmpty()
  @IsString()
  lot: string;

  @ApiProperty({ description: '프로젝트명', example: '고용량 배터리 개발' })
  @IsNotEmpty()
  @IsString()
  projectName: string;

  @ApiPropertyOptional({ description: 'Project No', example: 'PRJ-2025-001' })
  @IsOptional()
  @IsString()
  projectNo?: string;

  @ApiPropertyOptional({ description: '모델', example: 'NCM811-50Ah' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({ description: '등급', example: '양품', enum: CellGrade })
  @IsEnum(CellGrade)
  grade: CellGrade;

  @ApiPropertyOptional({ description: 'NCR 등급', example: 'NCR1' })
  @IsOptional()
  @IsString()
  ncrGrade?: string | null;

  @ApiProperty({ description: '보관 일자', example: '2025-01-07' })
  @IsDateString()
  date: Date;

  @ApiPropertyOptional({ description: '보관 위치', example: 'A-1' })
  @IsOptional()
  @IsString()
  storageLocation?: string;

  @ApiPropertyOptional({ description: '출고 일자', example: '2025-01-10' })
  @IsOptional()
  @IsDateString()
  shippingDate?: Date | null;

  @ApiPropertyOptional({ description: '출고 현황', example: '폐기' })
  @IsOptional()
  @IsString()
  shippingStatus?: string | null;

  @ApiProperty({ description: '인계자', example: '김철수' })
  @IsString()
  deliverer: string;

  @ApiProperty({ description: '인수자', example: '이영희' })
  @IsString()
  receiver: string;

  @ApiPropertyOptional({ description: '상세' })
  @IsOptional()
  @IsString()
  details?: string | null;

  @ApiPropertyOptional({ description: '출고 여부', example: false })
  @IsOptional()
  isShipped?: boolean;

  @ApiPropertyOptional({ description: '재입고 여부', example: false })
  @IsOptional()
  isRestocked?: boolean;
}

export class CreateCellInventoryDto extends OmitType(CellInventoryDto, ['id']) {}

export class UpdateCellInventoryDto extends PartialType(CreateCellInventoryDto) {}

export class CellInventoryResponseDto extends PartialType(CellInventoryDto) {}

export class GradeStatisticsDto {
  @ApiProperty({ description: '등급', example: '양품', enum: CellGrade })
  grade: CellGrade;

  @ApiProperty({ description: '입고량 (총 등록 수량)', example: 100, nullable: true })
  inStock: number | null;

  @ApiProperty({ description: '출고량', example: 50, nullable: true })
  shipped: number | null;

  @ApiProperty({ description: '보유 수량 (입고량 - 출고량)', example: 50, nullable: true })
  available: number | null;
}

export class ProjectStatisticsDto {
  @ApiProperty({ description: '프로젝트명', example: '프로젝트A' })
  projectName: string;

  @ApiProperty({ type: [GradeStatisticsDto] })
  grades: GradeStatisticsDto[];

  @ApiProperty({ description: '총 보유 수량', example: 60 })
  totalAvailable: number;
}
