import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { MaterialHistoryType, MaterialProcess } from '../enums/material.enum';

export class CreateMaterialHistoryDto {
  @ApiProperty({ description: '자재 ID', example: 1 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  materialId: number;

  @ApiProperty({ description: '공정 구분', example: '전극', enum: MaterialProcess })
  @IsNotEmpty()
  @IsEnum(MaterialProcess)
  process: MaterialProcess;

  @ApiProperty({ description: '입/출고 구분', example: '입고', enum: MaterialHistoryType })
  @IsNotEmpty()
  @IsEnum(MaterialHistoryType)
  type: MaterialHistoryType;

  @ApiProperty({ description: '이전 재고', example: 10 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  previousStock: number;

  @ApiProperty({ description: '현재 재고', example: 15 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  currentStock: number;
}

export class MaterialHistoryResponseDto {
  @ApiProperty({ description: 'ID', example: 1 })
  id: number;

  @ApiProperty({ description: '자재 ID', example: 1 })
  materialId: number;

  @ApiProperty({ description: '공정 구분', example: '전극', enum: MaterialProcess })
  process: MaterialProcess;

  @ApiProperty({ description: '입/출고 구분', example: '입고', enum: MaterialHistoryType })
  type: MaterialHistoryType;

  @ApiProperty({ description: '이전 재고', example: 10 })
  previousStock: number;

  @ApiProperty({ description: '현재 재고', example: 15 })
  currentStock: number;

  @ApiProperty({ description: '기록 시간', example: '2024-01-05T10:30:00Z' })
  createdAt: Date;
}
