import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MaterialCategory, MaterialClassification } from '../enums/material.enum';

export class MaterialItemDto {
  @ApiProperty({
    description: '자재 분류 (양극, 음극, 조립)',
    enum: MaterialClassification,
    example: MaterialClassification.CATHODE,
  })
  @IsEnum(MaterialClassification)
  classification: MaterialClassification;

  @ApiProperty({
    description: '자재 카테고리 (양극재, 도전재, 바인더 등)',
    enum: MaterialCategory,
    example: MaterialCategory.CATHODE_ACTIVE,
  })
  @IsEnum(MaterialCategory)
  category: MaterialCategory;

  @ApiProperty({
    description: '자재 종류 (예: LCO, CNT 등)',
    example: 'LCO',
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: '모델명 (예: 15DP, PVDF Solef 5130 등)',
    example: '15DP',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: '제조사 / 공급사',
    example: 'EASPRING',
  })
  @IsString()
  company: string;

  @ApiProperty({
    description: '단위 (예: kg, m, ea)',
    example: 'kg',
  })
  @IsString()
  unit: string;

  @ApiProperty({
    description: '소요량 (숫자)',
    example: 10,
  })
  @IsNumber()
  quantity: number;
}

export class CreateMaterialDto {
  @ApiProperty({
    description: '등록할 자재 목록 배열',
    type: [MaterialItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaterialItemDto)
  materials: MaterialItemDto[];
}
