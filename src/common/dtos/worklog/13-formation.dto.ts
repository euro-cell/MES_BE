import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { BaseWorklogDto, BaseWorklogListResponseDto } from './00-base-worklog.dto';

export class CreateFormationWorklogDto extends BaseWorklogDto {
  // ===== A. 자재 투입 정보 =====

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cellNumberRange?: string;

  // ===== B. 생산 정보 =====

  // 디가스1
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  degas1InputQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  degas1GoodQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  degas1DefectQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  degas1DiscardQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  degas1DefectRate?: number;

  // 프리포메이션
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  preFormationInputQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  preFormationGoodQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  preFormationDefectQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  preFormationDiscardQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  preFormationDefectRate?: number;

  // 프리포메이션 호기 1~5
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preFormation1UnitNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  preFormation1Quantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preFormation1CellNumberRange?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preFormation2UnitNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  preFormation2Quantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preFormation2CellNumberRange?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preFormation3UnitNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  preFormation3Quantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preFormation3CellNumberRange?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preFormation4UnitNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  preFormation4Quantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preFormation4CellNumberRange?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preFormation5UnitNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  preFormation5Quantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preFormation5CellNumberRange?: string;

  // 디가스2
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  degas2InputQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  degas2GoodQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  degas2DefectQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  degas2DiscardQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  degas2DefectRate?: number;

  // 셀 프레스
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  cellPressInputQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  cellPressGoodQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  cellPressDefectQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  cellPressDiscardQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  cellPressDefectRate?: number;

  // 파이널 실링
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  finalSealingInputQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  finalSealingGoodQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  finalSealingDefectQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  finalSealingDiscardQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  finalSealingDefectRate?: number;

  // 실링 두께 1~5
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  sealingThickness1?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  sealingThickness2?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  sealingThickness3?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  sealingThickness4?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  sealingThickness5?: number;

  // lot 마킹
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lotMarkingInputQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lotMarkingGoodQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lotMarkingDefectQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lotMarkingDiscardQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lotMarkingDefectRate?: number;

  // 메인포메이션
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  mainFormationInputQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  mainFormationGoodQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  mainFormationDefectQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  mainFormationDiscardQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  mainFormationDefectRate?: number;

  // 메인포메이션 호기 1~5
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mainFormation1UnitNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  mainFormation1Quantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mainFormation1CellNumberRange?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mainFormation2UnitNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  mainFormation2Quantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mainFormation2CellNumberRange?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mainFormation3UnitNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  mainFormation3Quantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mainFormation3CellNumberRange?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mainFormation4UnitNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  mainFormation4Quantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mainFormation4CellNumberRange?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mainFormation5UnitNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  mainFormation5Quantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mainFormation5CellNumberRange?: string;

  // OCV1
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  ocv1Quantity?: number;

  // Lot
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lotRange?: string;

  // ===== C. 공정 조건 =====

  // 프리포메이션
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preFormationVoltageCondition?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  preFormationLowerVoltage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  preFormationUpperVoltage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  preFormationAppliedCurrent?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  preFormationTemperature?: number;

  // 메인포메이션
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mainFormationVoltageCondition?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  mainFormationLowerVoltage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  mainFormationUpperVoltage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  mainFormationAppliedCurrent?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  mainFormationTemperature?: number;

  // 디가스
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  degasVacuumHoldTime?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  degasVacuumSealingAdhesionTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  degasVacuumDegree?: number;

  // OCV1
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ocv1MeasurementEquipmentName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ocv1VoltageSpec?: string;
}

export class UpdateFormationWorklogDto extends PartialType(CreateFormationWorklogDto) {}

export class FormationWorklogListResponseDto extends BaseWorklogListResponseDto {}
