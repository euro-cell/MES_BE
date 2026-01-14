import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsOptional, IsDateString, IsIn } from 'class-validator';
import { EquipmentCategory, EquipmentGrade, EquipmentProcess } from '../enums/equipment.enum';

// API용 영어 카테고리 → DB용 한글 카테고리 매핑
export const categoryMap: Record<string, EquipmentCategory> = {
  production: EquipmentCategory.PRODUCTION,
  development: EquipmentCategory.DEVELOPMENT,
  measurement: EquipmentCategory.MEASUREMENT,
};

export class CreateEquipmentDto {
  @ApiProperty({ description: '설비분류', enum: EquipmentCategory, example: '생산' })
  @IsNotEmpty()
  @IsEnum(EquipmentCategory)
  category: EquipmentCategory;

  @ApiPropertyOptional({ description: '공정구분', enum: EquipmentProcess, example: '전극' })
  @IsOptional()
  @IsEnum(EquipmentProcess)
  processType?: EquipmentProcess;

  @ApiProperty({ description: '자산번호', example: 'AST-001' })
  @IsNotEmpty()
  @IsString()
  assetNo: string;

  @ApiProperty({ description: '설비번호', example: 'EQ-001' })
  @IsNotEmpty()
  @IsString()
  equipmentNo: string;

  @ApiProperty({ description: '설비명', example: '코팅기 1호' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: '제조사', example: '삼성전자' })
  @IsNotEmpty()
  @IsString()
  manufacturer: string;

  @ApiProperty({ description: '구입일자', example: '2024-01-15' })
  @IsNotEmpty()
  @IsDateString()
  purchaseDate: string;

  @ApiPropertyOptional({ description: '설비등급', enum: EquipmentGrade, example: 'A' })
  @IsOptional()
  @IsEnum(EquipmentGrade)
  grade?: EquipmentGrade;

  @ApiPropertyOptional({ description: '보전방법 (사전/사후/폐기/폐기예정 등)', example: '사전' })
  @IsOptional()
  @IsString()
  maintenanceMethod?: string;

  @ApiPropertyOptional({ description: '비고' })
  @IsOptional()
  @IsString()
  remark?: string;

  // 측정 설비 전용 필드
  @ApiPropertyOptional({ description: '기기번호 (측정 설비 전용)', example: 'DEV-001' })
  @IsOptional()
  @IsString()
  deviceNo?: string;

  @ApiPropertyOptional({ description: '교정일 (측정 설비 전용)', example: '2024-01-15' })
  @IsOptional()
  @IsDateString()
  calibrationDate?: string;

  @ApiPropertyOptional({ description: '차기 교정일 (측정 설비 전용)', example: '2025-01-15' })
  @IsOptional()
  @IsDateString()
  nextCalibrationDate?: string;

  @ApiPropertyOptional({ description: '검교정 기관 (측정 설비 전용)', example: 'KTC' })
  @IsOptional()
  @IsString()
  calibrationAgency?: string;
}

export class UpdateEquipmentDto extends PartialType(CreateEquipmentDto) {}

export class EquipmentSearchDto {
  @ApiProperty({
    description: '설비분류 (production/development/measurement)',
    enum: ['production', 'development', 'measurement'],
    example: 'production',
  })
  @IsNotEmpty()
  @IsIn(['production', 'development', 'measurement'])
  category: string;
}

export class EquipmentResponseDto {
  @ApiProperty({ description: '설비 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '설비분류', enum: EquipmentCategory })
  category: EquipmentCategory;

  @ApiPropertyOptional({ description: '공정구분', enum: EquipmentProcess })
  processType?: EquipmentProcess;

  @ApiProperty({ description: '자산번호' })
  assetNo: string;

  @ApiProperty({ description: '설비번호' })
  equipmentNo: string;

  @ApiProperty({ description: '설비명' })
  name: string;

  @ApiProperty({ description: '제조사' })
  manufacturer: string;

  @ApiProperty({ description: '구입일자' })
  purchaseDate: Date;

  @ApiPropertyOptional({ description: '설비등급', enum: EquipmentGrade })
  grade?: EquipmentGrade;

  @ApiPropertyOptional({ description: '보전방법' })
  maintenanceMethod?: string;

  @ApiPropertyOptional({ description: '비고' })
  remark?: string;

  @ApiPropertyOptional({ description: '기기번호' })
  deviceNo?: string;

  @ApiPropertyOptional({ description: '교정일' })
  calibrationDate?: Date;

  @ApiPropertyOptional({ description: '차기 교정일' })
  nextCalibrationDate?: Date;

  @ApiPropertyOptional({ description: '검교정 기관' })
  calibrationAgency?: string;
}
