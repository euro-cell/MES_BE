import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { BaseWorklogDto, BaseWorklogListResponseDto } from './00-base-worklog.dto';

export class CreateFormingWorklogDto extends BaseWorklogDto {
  // ===== A. 자재 투입 정보 =====

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pouchLot?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pouchManufacturer?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pouchSpec?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  pouchUsage?: number;

  // ===== B. 생산 정보 =====

  // 컷팅
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  cuttingWorkQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  cuttingGoodQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  cuttingDefectQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  cuttingDiscardQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  cuttingDefectRate?: number;

  // 포밍
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  formingWorkQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  formingGoodQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  formingDefectQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  formingDiscardQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  formingDefectRate?: number;

  // 폴딩
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  foldingWorkQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  foldingGoodQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  foldingDefectQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  foldingDiscardQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  foldingDefectRate?: number;

  // 탑컷팅
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  topCuttingWorkQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  topCuttingGoodQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  topCuttingDefectQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  topCuttingDiscardQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  topCuttingDefectRate?: number;

  // ===== C. 공정 조건 =====

  // 컷팅
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  cuttingLength?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cuttingChecklist?: string;

  // 포밍
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  formingDepth?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  formingStopperHeight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  formingChecklist?: string;

  // 탑컷팅
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  topCuttingLength?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  topCuttingChecklist?: string;
}

export class UpdateFormingWorklogDto extends PartialType(CreateFormingWorklogDto) {}

export class FormingWorklogListResponseDto extends BaseWorklogListResponseDto {}
