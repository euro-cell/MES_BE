import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { BaseWorklogDto, BaseWorklogListResponseDto } from './00-base-worklog.dto';

export class CreateCoatingWorklogDto extends BaseWorklogDto {

  // 자재 투입 정보 1
  @ApiPropertyOptional({ description: '자재 구분', example: 'Al Foil' })
  @IsOptional()
  @IsString()
  materialType?: string;

  @ApiPropertyOptional({ description: '자재 LOT', example: 'LOT-2024-001' })
  @IsOptional()
  @IsString()
  materialLot?: string;

  @ApiPropertyOptional({ description: '제조사', example: 'ABC제조' })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiPropertyOptional({ description: 'Spec.', example: '10μm' })
  @IsOptional()
  @IsString()
  spec?: string;

  @ApiPropertyOptional({ description: '투입량', example: 1000.5 })
  @IsOptional()
  @IsNumber()
  inputAmount?: number;

  @ApiPropertyOptional({ description: '사용량', example: 950.3 })
  @IsOptional()
  @IsNumber()
  usageAmount?: number;

  // 자재 투입 정보 2
  @ApiPropertyOptional({ description: '자재 구분2', example: 'Slurry' })
  @IsOptional()
  @IsString()
  materialType2?: string;

  @ApiPropertyOptional({ description: '자재 LOT2', example: 'SLURRY-2024-001' })
  @IsOptional()
  @IsString()
  materialLot2?: string;

  @ApiPropertyOptional({ description: '고형분', example: 45.5 })
  @IsOptional()
  @IsNumber()
  solidContent?: number;

  @ApiPropertyOptional({ description: '점도', example: '1500 cps' })
  @IsOptional()
  @IsString()
  viscosity?: string;

  @ApiPropertyOptional({ description: '투입량 설계', example: 500.0 })
  @IsOptional()
  @IsNumber()
  inputAmountDesign?: number;

  @ApiPropertyOptional({ description: '투입량 실제', example: 498.5 })
  @IsOptional()
  @IsNumber()
  inputAmountActual?: number;

  // 생산 정보 1차
  @ApiPropertyOptional({ description: '코팅 LOT 1차', example: 'COAT-001' })
  @IsOptional()
  @IsString()
  coatingLot1?: string;

  @ApiPropertyOptional({ description: '생산 수량 1차', example: 1000 })
  @IsOptional()
  @IsNumber()
  productionQuantity1?: number;

  @ApiPropertyOptional({ description: '코팅 면 1차', example: '양면' })
  @IsOptional()
  @IsString()
  coatingSide1?: string;

  @ApiPropertyOptional({ description: '모노펌프 전단 1차', example: 50.5 })
  @IsOptional()
  @IsNumber()
  monoPumpFront1?: number;

  @ApiPropertyOptional({ description: '모노펌프 후단 1차', example: 50.5 })
  @IsOptional()
  @IsNumber()
  monoPumpRear1?: number;

  @ApiPropertyOptional({ description: '코팅 속도 전단 1차', example: 10.5 })
  @IsOptional()
  @IsNumber()
  coatingSpeedFront1?: number;

  @ApiPropertyOptional({ description: '코팅 속도 후단 1차', example: 10.5 })
  @IsOptional()
  @IsNumber()
  coatingSpeedRear1?: number;

  @ApiPropertyOptional({ description: '면적밀도 전단 M 1차', example: 25.5 })
  @IsOptional()
  @IsNumber()
  weightPerAreaFront1M?: number;

  @ApiPropertyOptional({ description: '면적밀도 전단 C 1차', example: 25.3 })
  @IsOptional()
  @IsNumber()
  weightPerAreaFront1C?: number;

  @ApiPropertyOptional({ description: '면적밀도 전단 D 1차', example: 25.7 })
  @IsOptional()
  @IsNumber()
  weightPerAreaFront1D?: number;

  @ApiPropertyOptional({ description: '면적밀도 후단 M 1차', example: 25.5 })
  @IsOptional()
  @IsNumber()
  weightPerAreaRear1M?: number;

  @ApiPropertyOptional({ description: '면적밀도 후단 C 1차', example: 25.3 })
  @IsOptional()
  @IsNumber()
  weightPerAreaRear1C?: number;

  @ApiPropertyOptional({ description: '면적밀도 후단 D 1차', example: 25.7 })
  @IsOptional()
  @IsNumber()
  weightPerAreaRear1D?: number;

  @ApiPropertyOptional({ description: '두께 전단 M 1차', example: 100.5 })
  @IsOptional()
  @IsNumber()
  thicknessFront1M?: number;

  @ApiPropertyOptional({ description: '두께 전단 C 1차', example: 100.3 })
  @IsOptional()
  @IsNumber()
  thicknessFront1C?: number;

  @ApiPropertyOptional({ description: '두께 전단 D 1차', example: 100.7 })
  @IsOptional()
  @IsNumber()
  thicknessFront1D?: number;

  @ApiPropertyOptional({ description: '두께 후단 M 1차', example: 100.5 })
  @IsOptional()
  @IsNumber()
  thicknessRear1M?: number;

  @ApiPropertyOptional({ description: '두께 후단 C 1차', example: 100.3 })
  @IsOptional()
  @IsNumber()
  thicknessRear1C?: number;

  @ApiPropertyOptional({ description: '두께 후단 D 1차', example: 100.7 })
  @IsOptional()
  @IsNumber()
  thicknessRear1D?: number;

  // 생산 정보 2차
  @ApiPropertyOptional({ description: '코팅 LOT 2차' })
  @IsOptional()
  @IsString()
  coatingLot2?: string;

  @ApiPropertyOptional({ description: '생산 수량 2차' })
  @IsOptional()
  @IsNumber()
  productionQuantity2?: number;

  @ApiPropertyOptional({ description: '코팅 면 2차' })
  @IsOptional()
  @IsString()
  coatingSide2?: string;

  @ApiPropertyOptional({ description: '모노펌프 전단 2차' })
  @IsOptional()
  @IsNumber()
  monoPumpFront2?: number;

  @ApiPropertyOptional({ description: '모노펌프 후단 2차' })
  @IsOptional()
  @IsNumber()
  monoPumpRear2?: number;

  @ApiPropertyOptional({ description: '코팅 속도 전단 2차' })
  @IsOptional()
  @IsNumber()
  coatingSpeedFront2?: number;

  @ApiPropertyOptional({ description: '코팅 속도 후단 2차' })
  @IsOptional()
  @IsNumber()
  coatingSpeedRear2?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  weightPerAreaFront2M?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  weightPerAreaFront2C?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  weightPerAreaFront2D?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  weightPerAreaRear2M?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  weightPerAreaRear2C?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  weightPerAreaRear2D?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  thicknessFront2M?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  thicknessFront2C?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  thicknessFront2D?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  thicknessRear2M?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  thicknessRear2C?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  thicknessRear2D?: number;

  // 생산 정보 3차
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coatingLot3?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  productionQuantity3?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coatingSide3?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  monoPumpFront3?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  monoPumpRear3?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  coatingSpeedFront3?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  coatingSpeedRear3?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  weightPerAreaFront3M?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  weightPerAreaFront3C?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  weightPerAreaFront3D?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  weightPerAreaRear3M?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  weightPerAreaRear3C?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  weightPerAreaRear3D?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  thicknessFront3M?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  thicknessFront3C?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  thicknessFront3D?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  thicknessRear3M?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  thicknessRear3C?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  thicknessRear3D?: number;

  // 생산 정보 4차
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coatingLot4?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  productionQuantity4?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coatingSide4?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  monoPumpFront4?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  monoPumpRear4?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  coatingSpeedFront4?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  coatingSpeedRear4?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  weightPerAreaFront4M?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  weightPerAreaFront4C?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  weightPerAreaFront4D?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  weightPerAreaRear4M?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  weightPerAreaRear4C?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  weightPerAreaRear4D?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  thicknessFront4M?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  thicknessFront4C?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  thicknessFront4D?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  thicknessRear4M?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  thicknessRear4C?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  thicknessRear4D?: number;

  // 건조 조건
  @ApiPropertyOptional({ description: 'Zone 1 온도 상부', example: 120.0 })
  @IsOptional()
  @IsNumber()
  zone1TempUpper?: number;

  @ApiPropertyOptional({ description: 'Zone 1 온도 하부', example: 120.0 })
  @IsOptional()
  @IsNumber()
  zone1TempLower?: number;

  @ApiPropertyOptional({ description: 'Zone 2 온도 상부', example: 130.0 })
  @IsOptional()
  @IsNumber()
  zone2TempUpper?: number;

  @ApiPropertyOptional({ description: 'Zone 2 온도 하부', example: 130.0 })
  @IsOptional()
  @IsNumber()
  zone2TempLower?: number;

  @ApiPropertyOptional({ description: 'Zone 3 온도', example: 140.0 })
  @IsOptional()
  @IsNumber()
  zone3Temp?: number;

  @ApiPropertyOptional({ description: 'Zone 4 온도', example: 150.0 })
  @IsOptional()
  @IsNumber()
  zone4Temp?: number;

  // 공급 풍량
  @ApiPropertyOptional({ description: 'Zone 1 공급 풍량 상부', example: 500.0 })
  @IsOptional()
  @IsNumber()
  zone1SupplyAirflowUpper?: number;

  @ApiPropertyOptional({ description: 'Zone 1 공급 풍량 하부', example: 500.0 })
  @IsOptional()
  @IsNumber()
  zone1SupplyAirflowLower?: number;

  @ApiPropertyOptional({ description: 'Zone 2 공급 풍량 상부', example: 500.0 })
  @IsOptional()
  @IsNumber()
  zone2SupplyAirflowUpper?: number;

  @ApiPropertyOptional({ description: 'Zone 2 공급 풍량 하부', example: 500.0 })
  @IsOptional()
  @IsNumber()
  zone2SupplyAirflowLower?: number;

  @ApiPropertyOptional({ description: 'Zone 3 공급 풍량', example: 500.0 })
  @IsOptional()
  @IsNumber()
  zone3SupplyAirflow?: number;

  @ApiPropertyOptional({ description: 'Zone 4 공급 풍량', example: 500.0 })
  @IsOptional()
  @IsNumber()
  zone4SupplyAirflow?: number;

  // 배기 풍량
  @ApiPropertyOptional({ description: 'Zone 1&2 배기 풍량', example: 1000.0 })
  @IsOptional()
  @IsNumber()
  zone12ExhaustAirflow?: number;

  @ApiPropertyOptional({ description: 'Zone 3&4 배기 풍량', example: 1000.0 })
  @IsOptional()
  @IsNumber()
  zone34ExhaustAirflow?: number;

  @ApiPropertyOptional({ description: '캡슐 필터', example: 50.0 })
  @IsOptional()
  @IsNumber()
  capsuleFilter?: number;

  @ApiPropertyOptional({ description: '코팅 속도', example: 10.5 })
  @IsOptional()
  @IsNumber()
  coatingSpeed?: number;

  @ApiPropertyOptional({ description: '메쉬 필터', example: 50.0 })
  @IsOptional()
  @IsNumber()
  meshFilter?: number;

  // 장력
  @ApiPropertyOptional({ description: '장력 UnT', example: 50.0 })
  @IsOptional()
  @IsNumber()
  tensionUnT?: number;

  @ApiPropertyOptional({ description: '장력 OfT', example: 50.0 })
  @IsOptional()
  @IsNumber()
  tensionOfT?: number;

  @ApiPropertyOptional({ description: '장력 ReT', example: 50.0 })
  @IsOptional()
  @IsNumber()
  tensionReT?: number;

  // 코팅 조건
  @ApiPropertyOptional({ description: '코팅 조건 단면', example: '10μm' })
  @IsOptional()
  @IsString()
  coatingConditionSingle?: string;

  @ApiPropertyOptional({ description: '코팅 조건 양면', example: '20μm' })
  @IsOptional()
  @IsString()
  coatingConditionDouble?: string;
}

export class UpdateCoatingWorklogDto extends PartialType(CreateCoatingWorklogDto) {}

export class CoatingWorklogListResponseDto extends BaseWorklogListResponseDto {}
