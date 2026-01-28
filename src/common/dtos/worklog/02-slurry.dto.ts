import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { BaseWorklogDto, BaseWorklogListResponseDto } from './00-base-worklog.dto';

export class CreateSlurryWorklogDto extends BaseWorklogDto {
  // 원료 1-8 (각각 5개 필드: 명칭, 조성, LOT, 투입계획, 투입실적)
  @ApiPropertyOptional({ description: '원료1 명칭', example: 'NCM' })
  @IsOptional()
  @IsString()
  material1Name?: string;

  @ApiPropertyOptional({ description: '원료1 조성', example: 94.0 })
  @IsOptional()
  @IsNumber()
  material1Composition?: number;

  @ApiPropertyOptional({ description: '원료1 LOT', example: 'NCM-2024-001' })
  @IsOptional()
  @IsString()
  material1Lot?: string;

  @ApiPropertyOptional({ description: '원료1 투입계획', example: 15000.0 })
  @IsOptional()
  @IsNumber()
  material1PlannedInput?: number;

  @ApiPropertyOptional({ description: '원료1 투입실적', example: 14998.5 })
  @IsOptional()
  @IsNumber()
  material1ActualInput?: number;

  @ApiPropertyOptional({ description: '원료2 명칭', example: 'Super-P' })
  @IsOptional()
  @IsString()
  material2Name?: string;

  @ApiPropertyOptional({ description: '원료2 조성', example: 1.5 })
  @IsOptional()
  @IsNumber()
  material2Composition?: number;

  @ApiPropertyOptional({ description: '원료2 LOT', example: 'SP-2024-001' })
  @IsOptional()
  @IsString()
  material2Lot?: string;

  @ApiPropertyOptional({ description: '원료2 투입계획', example: 240.0 })
  @IsOptional()
  @IsNumber()
  material2PlannedInput?: number;

  @ApiPropertyOptional({ description: '원료2 투입실적', example: 239.8 })
  @IsOptional()
  @IsNumber()
  material2ActualInput?: number;

  @ApiPropertyOptional({ description: '원료3 명칭', example: 'CNT' })
  @IsOptional()
  @IsString()
  material3Name?: string;

  @ApiPropertyOptional({ description: '원료3 조성', example: 0.5 })
  @IsOptional()
  @IsNumber()
  material3Composition?: number;

  @ApiPropertyOptional({ description: '원료3 LOT', example: 'CNT-2024-001' })
  @IsOptional()
  @IsString()
  material3Lot?: string;

  @ApiPropertyOptional({ description: '원료3 투입계획', example: 80.0 })
  @IsOptional()
  @IsNumber()
  material3PlannedInput?: number;

  @ApiPropertyOptional({ description: '원료3 투입실적', example: 79.9 })
  @IsOptional()
  @IsNumber()
  material3ActualInput?: number;

  @ApiPropertyOptional({ description: '원료4 명칭' })
  @IsOptional()
  @IsString()
  material4Name?: string;

  @ApiPropertyOptional({ description: '원료4 조성' })
  @IsOptional()
  @IsNumber()
  material4Composition?: number;

  @ApiPropertyOptional({ description: '원료4 LOT' })
  @IsOptional()
  @IsString()
  material4Lot?: string;

  @ApiPropertyOptional({ description: '원료4 투입계획' })
  @IsOptional()
  @IsNumber()
  material4PlannedInput?: number;

  @ApiPropertyOptional({ description: '원료4 투입실적' })
  @IsOptional()
  @IsNumber()
  material4ActualInput?: number;

  @ApiPropertyOptional({ description: '원료5 명칭' })
  @IsOptional()
  @IsString()
  material5Name?: string;

  @ApiPropertyOptional({ description: '원료5 조성' })
  @IsOptional()
  @IsNumber()
  material5Composition?: number;

  @ApiPropertyOptional({ description: '원료5 LOT' })
  @IsOptional()
  @IsString()
  material5Lot?: string;

  @ApiPropertyOptional({ description: '원료5 투입계획' })
  @IsOptional()
  @IsNumber()
  material5PlannedInput?: number;

  @ApiPropertyOptional({ description: '원료5 투입실적' })
  @IsOptional()
  @IsNumber()
  material5ActualInput?: number;

  @ApiPropertyOptional({ description: '원료6 명칭' })
  @IsOptional()
  @IsString()
  material6Name?: string;

  @ApiPropertyOptional({ description: '원료6 조성' })
  @IsOptional()
  @IsNumber()
  material6Composition?: number;

  @ApiPropertyOptional({ description: '원료6 LOT' })
  @IsOptional()
  @IsString()
  material6Lot?: string;

  @ApiPropertyOptional({ description: '원료6 투입계획' })
  @IsOptional()
  @IsNumber()
  material6PlannedInput?: number;

  @ApiPropertyOptional({ description: '원료6 투입실적' })
  @IsOptional()
  @IsNumber()
  material6ActualInput?: number;

  // 바인더용액 (Binder Solution)
  @ApiPropertyOptional({ description: '바인더용액 조성 (%)', example: 4.5 })
  @IsOptional()
  @IsNumber()
  binderSolutionComposition?: number;

  @ApiPropertyOptional({ description: '바인더용액 LOT', example: 'BS-2024-001' })
  @IsOptional()
  @IsString()
  binderSolutionLot?: string;

  @ApiPropertyOptional({ description: '바인더용액 투입량 설계', example: 500.0 })
  @IsOptional()
  @IsNumber()
  binderSolutionPlannedInput?: number;

  @ApiPropertyOptional({ description: '바인더용액 투입량 실제', example: 498.5 })
  @IsOptional()
  @IsNumber()
  binderSolutionActualInput?: number;

  // 용매 (Solvent)
  @ApiPropertyOptional({ description: '용매 Add 투입량 설계', example: 100.0 })
  @IsOptional()
  @IsNumber()
  solventAddPlannedInput?: number;

  @ApiPropertyOptional({ description: '용매 Add 투입량 실제', example: 99.8 })
  @IsOptional()
  @IsNumber()
  solventAddActualInput?: number;

  @ApiPropertyOptional({ description: '용매 Total 투입량 설계', example: 1000.0 })
  @IsOptional()
  @IsNumber()
  solventTotalPlannedInput?: number;

  @ApiPropertyOptional({ description: '용매 Total 투입량 실제', example: 998.5 })
  @IsOptional()
  @IsNumber()
  solventTotalActualInput?: number;

  // 바인더 정보
  @ApiPropertyOptional({ description: '바인더 LOT' })
  @IsOptional()
  @IsString()
  binderLot?: string;

  @ApiPropertyOptional({ description: '바인더 조성' })
  @IsOptional()
  @IsNumber()
  binderComposition?: number;

  @ApiPropertyOptional({ description: '바인더 투입계획' })
  @IsOptional()
  @IsNumber()
  binderPlannedInput?: number;

  @ApiPropertyOptional({ description: '바인더 투입실적' })
  @IsOptional()
  @IsNumber()
  binderActualInput?: number;

  // 슬러리 정보
  @ApiPropertyOptional({ description: '슬러리 LOT' })
  @IsOptional()
  @IsString()
  slurryLot?: string;

  @ApiPropertyOptional({ description: '고형분' })
  @IsOptional()
  @IsNumber()
  solidContent?: number;

  @ApiPropertyOptional({ description: 'Binder Solution', example: 5.5 })
  @IsOptional()
  @IsNumber()
  binderSolution?: number;

  @ApiPropertyOptional({ description: '점도' })
  @IsOptional()
  @IsNumber()
  viscosity?: number;

  // 공정 단계별 정보 (분산1, 분산2, 혼합1, 혼합2, 감압)
  // 각 단계마다 투입량, 온도, 저속RPM, 고속RPM, 시작시간, 종료시간

  @ApiPropertyOptional({ description: '분산1 투입량' })
  @IsOptional()
  @IsNumber()
  dispersion1Input?: number;

  @ApiPropertyOptional({ description: '분산1 온도' })
  @IsOptional()
  @IsNumber()
  dispersion1Temp?: number;

  @ApiPropertyOptional({ description: '분산1 저속 RPM' })
  @IsOptional()
  @IsNumber()
  dispersion1RpmLow?: number;

  @ApiPropertyOptional({ description: '분산1 고속 RPM' })
  @IsOptional()
  @IsNumber()
  dispersion1RpmHigh?: number;

  @ApiPropertyOptional({ description: '분산1 시작 시간' })
  @IsOptional()
  @IsString()
  dispersion1StartTime?: string;

  @ApiPropertyOptional({ description: '분산1 종료 시간' })
  @IsOptional()
  @IsString()
  dispersion1EndTime?: string;

  @ApiPropertyOptional({ description: '분산2 투입량' })
  @IsOptional()
  @IsNumber()
  dispersion2Input?: number;

  @ApiPropertyOptional({ description: '분산2 온도' })
  @IsOptional()
  @IsNumber()
  dispersion2Temp?: number;

  @ApiPropertyOptional({ description: '분산2 저속 RPM' })
  @IsOptional()
  @IsNumber()
  dispersion2RpmLow?: number;

  @ApiPropertyOptional({ description: '분산2 고속 RPM' })
  @IsOptional()
  @IsNumber()
  dispersion2RpmHigh?: number;

  @ApiPropertyOptional({ description: '분산2 시작 시간' })
  @IsOptional()
  @IsString()
  dispersion2StartTime?: string;

  @ApiPropertyOptional({ description: '분산2 종료 시간' })
  @IsOptional()
  @IsString()
  dispersion2EndTime?: string;

  @ApiPropertyOptional({ description: '혼합1 투입량' })
  @IsOptional()
  @IsNumber()
  mixing1Input?: number;

  @ApiPropertyOptional({ description: '혼합1 온도' })
  @IsOptional()
  @IsNumber()
  mixing1Temp?: number;

  @ApiPropertyOptional({ description: '혼합1 저속 RPM' })
  @IsOptional()
  @IsNumber()
  mixing1RpmLow?: number;

  @ApiPropertyOptional({ description: '혼합1 고속 RPM' })
  @IsOptional()
  @IsNumber()
  mixing1RpmHigh?: number;

  @ApiPropertyOptional({ description: '혼합1 시작 시간' })
  @IsOptional()
  @IsString()
  mixing1StartTime?: string;

  @ApiPropertyOptional({ description: '혼합1 종료 시간' })
  @IsOptional()
  @IsString()
  mixing1EndTime?: string;

  @ApiPropertyOptional({ description: '혼합2 투입량' })
  @IsOptional()
  @IsNumber()
  mixing2Input?: number;

  @ApiPropertyOptional({ description: '혼합2 온도' })
  @IsOptional()
  @IsNumber()
  mixing2Temp?: number;

  @ApiPropertyOptional({ description: '혼합2 저속 RPM' })
  @IsOptional()
  @IsNumber()
  mixing2RpmLow?: number;

  @ApiPropertyOptional({ description: '혼합2 고속 RPM' })
  @IsOptional()
  @IsNumber()
  mixing2RpmHigh?: number;

  @ApiPropertyOptional({ description: '혼합2 시작 시간' })
  @IsOptional()
  @IsString()
  mixing2StartTime?: string;

  @ApiPropertyOptional({ description: '혼합2 종료 시간' })
  @IsOptional()
  @IsString()
  mixing2EndTime?: string;

  @ApiPropertyOptional({ description: '감압 투입량' })
  @IsOptional()
  @IsNumber()
  depressionInput?: number;

  @ApiPropertyOptional({ description: '감압 온도' })
  @IsOptional()
  @IsNumber()
  depressionTemp?: number;

  @ApiPropertyOptional({ description: '감압 저속 RPM' })
  @IsOptional()
  @IsNumber()
  depressionRpmLow?: number;

  @ApiPropertyOptional({ description: '감압 고속 RPM' })
  @IsOptional()
  @IsNumber()
  depressionRpmHigh?: number;

  @ApiPropertyOptional({ description: '감압 시작 시간' })
  @IsOptional()
  @IsString()
  depressionStartTime?: string;

  @ApiPropertyOptional({ description: '감압 종료 시간' })
  @IsOptional()
  @IsString()
  depressionEndTime?: string;
}

export class UpdateSlurryWorklogDto extends PartialType(CreateSlurryWorklogDto) {}

export class SlurryWorklogListResponseDto extends BaseWorklogListResponseDto {}
