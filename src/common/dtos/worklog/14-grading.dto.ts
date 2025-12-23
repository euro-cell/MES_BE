import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { BaseWorklogDto, BaseWorklogListResponseDto } from './00-base-worklog.dto';

export class CreateGradingWorklogDto extends BaseWorklogDto {
  // ===== A. 자재 투입 정보 =====

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cellNumberRange?: string;

  // ===== B. 생산 정보 =====

  // OCV2
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  ocv2InputQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  ocv2GoodQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  ocv2DefectQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  ocv2DiscardQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  ocv2DefectRate?: number;

  // Lot1 (OCV2와 Grading 사이)
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lot1Range?: string;

  // Grading
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  gradingInputQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  gradingGoodQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  gradingDefectQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  gradingDiscardQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  gradingDefectRate?: number;

  // Grading 호기 1~5
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  grading1UnitNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  grading1CellNumberRange?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  grading1Quantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  grading2UnitNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  grading2CellNumberRange?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  grading2Quantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  grading3UnitNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  grading3CellNumberRange?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  grading3Quantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  grading4UnitNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  grading4CellNumberRange?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  grading4Quantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  grading5UnitNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  grading5CellNumberRange?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  grading5Quantity?: number;

  // OCV3
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  ocv3InputQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  ocv3GoodQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  ocv3DefectQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  ocv3DiscardQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  ocv3DefectRate?: number;

  // Lot2 (OCV3 다음)
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lot2Range?: string;

  // ===== C. 공정 조건 =====

  // Grading
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gradingVoltageCondition?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  gradingLowerVoltage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  gradingUpperVoltage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  gradingAppliedCurrent?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  gradingTemperature?: number;

  // OCV2
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ocv2MeasurementEquipmentName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ocv2VoltageSpec?: string;

  // OCV3
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ocv3MeasurementEquipmentName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ocv3VoltageSpec?: string;
}

export class UpdateGradingWorklogDto extends PartialType(CreateGradingWorklogDto) {}

export class GradingWorklogListResponseDto extends BaseWorklogListResponseDto {}
