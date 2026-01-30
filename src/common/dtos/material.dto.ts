import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { MaterialOrigin, MaterialProcess, MaterialPurpose } from '../enums/material.enum';

export class MaterialDto {
  @ApiProperty({ description: '자재 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '공정 구분', example: '전극', enum: MaterialProcess })
  process: MaterialProcess;

  @ApiProperty({ description: '자재 분류 (중분류)', example: '양극재' })
  category: string;

  @ApiProperty({ description: '자재 종류 (소분류)', example: 'NCM622' })
  type: string;

  @ApiProperty({ description: '용도', example: '생산', enum: MaterialPurpose })
  purpose: MaterialPurpose;

  @ApiProperty({ description: '제품명', example: 'ME-6E2XP' })
  name: string;

  @ApiPropertyOptional({ description: '스펙', example: '10kg/bag' })
  spec?: string;

  @ApiPropertyOptional({ description: 'Lot No.', example: 'CZ-ME6E2XP-24051401' })
  lotNo?: string;

  @ApiPropertyOptional({ description: '제조/공급처', example: 'EASPRING' })
  company?: string;

  @ApiProperty({ description: '국내/해외', example: '해외', enum: MaterialOrigin })
  origin: MaterialOrigin;

  @ApiProperty({ description: '단위', example: 'kg' })
  unit: string;

  @ApiPropertyOptional({ description: '가격', example: 0 })
  price?: number;

  @ApiPropertyOptional({ description: '비고' })
  note?: string;

  @ApiPropertyOptional({ description: '재고', example: 10 })
  stock?: number;
}

export class MaterialListResponseDto extends OmitType(MaterialDto, ['id'] as const) {
  @ApiProperty({ description: '자재 ID', example: 1 })
  id: number;
}

export class CreateMaterialDto extends OmitType(MaterialDto, ['id'] as const) {
  @ApiProperty({ description: '공정 구분', example: '전극', enum: MaterialProcess })
  @IsNotEmpty()
  @IsEnum(MaterialProcess)
  process: MaterialProcess;

  @ApiProperty({ description: '자재 분류 (중분류)', example: '양극재' })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty({ description: '자재 종류 (소분류)', example: 'NCM622' })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty({ description: '용도', example: '생산', enum: MaterialPurpose })
  @IsNotEmpty()
  @IsEnum(MaterialPurpose)
  purpose: MaterialPurpose;

  @ApiProperty({ description: '제품명', example: 'ME-6E2XP' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '스펙', example: '10kg/bag' })
  @IsOptional()
  @IsString()
  spec?: string;

  @ApiPropertyOptional({ description: 'Lot No.', example: 'CZ-ME6E2XP-24051401' })
  @IsOptional()
  @IsString()
  lotNo?: string;

  @ApiPropertyOptional({ description: '제조/공급처', example: 'EASPRING' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiProperty({ description: '국내/해외', example: '해외', enum: MaterialOrigin })
  @IsNotEmpty()
  @IsEnum(MaterialOrigin)
  origin: MaterialOrigin;

  @ApiProperty({ description: '단위', example: 'kg' })
  @IsNotEmpty()
  @IsString()
  unit: string;

  @ApiPropertyOptional({ description: '가격', example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ description: '비고' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ description: '재고', example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  stock?: number;
}

export class UpdateMaterialDto extends PartialType(CreateMaterialDto) {}

// Import 관련 DTO
export class ImportMaterialItemDto {
  @ApiProperty({ description: '자재 분류 (중분류)', example: '양극재' })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiPropertyOptional({ description: '자재 종류 (소분류)', example: 'NCM622' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: '용도', example: '생산' })
  @IsOptional()
  @IsString()
  purpose?: string;

  @ApiPropertyOptional({ description: '제품명', example: 'ME-6E2XP' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '규격', example: '10kg/bag' })
  @IsOptional()
  @IsString()
  spec?: string;

  @ApiProperty({ description: 'Lot No.', example: 'CZ-ME6E2XP-24051401' })
  @IsNotEmpty()
  @IsString()
  lotNo: string;

  @ApiPropertyOptional({ description: '제조/공급처', example: 'EASPRING' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({ description: '국내/외 (기본값: 국내)', example: '국내' })
  @IsOptional()
  @IsString()
  origin?: string;

  @ApiPropertyOptional({ description: '단위', example: 'kg' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ description: '가격', example: 50000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ description: '비고' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ description: '재고', example: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  stock?: number;
}

export class ImportMaterialDto {
  @ApiProperty({ description: '자재 목록', type: [ImportMaterialItemDto] })
  @IsNotEmpty()
  materials: ImportMaterialItemDto[];
}

export class ImportMaterialResultDto {
  @ApiProperty({ description: '신규 등록된 건수', example: 5 })
  created: number;

  @ApiProperty({ description: '수정된 건수', example: 10 })
  updated: number;
}
