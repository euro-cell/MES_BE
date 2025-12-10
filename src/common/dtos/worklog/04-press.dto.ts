import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { BaseWorklogDto, BaseWorklogListResponseDto } from './00-base-worklog.dto';

export class CreatePressWorklogDto extends BaseWorklogDto {
  // A. 자재 투입 정보
  @ApiPropertyOptional({ description: '코팅 롤 LOT 1', example: 'COAT-ROLL-001' })
  @IsOptional()
  @IsString()
  coatingRollLot1?: string;

  @ApiPropertyOptional({ description: '코팅 롤 LOT 2', example: 'COAT-ROLL-002' })
  @IsOptional()
  @IsString()
  coatingRollLot2?: string;

  @ApiPropertyOptional({ description: '코팅 롤 LOT 3', example: 'COAT-ROLL-003' })
  @IsOptional()
  @IsString()
  coatingRollLot3?: string;

  @ApiPropertyOptional({ description: '코팅 롤 LOT 4', example: 'COAT-ROLL-004' })
  @IsOptional()
  @IsString()
  coatingRollLot4?: string;

  @ApiPropertyOptional({ description: '코팅 롤 LOT 5', example: 'COAT-ROLL-005' })
  @IsOptional()
  @IsString()
  coatingRollLot5?: string;

  @ApiPropertyOptional({ description: '목표 두께', example: 100 })
  @IsOptional()
  @IsNumber()
  targetThickness?: number;

  // B. 생산 정보 1차
  @ApiPropertyOptional({ description: '코팅 LOT 1차', example: 'COAT-001' })
  @IsOptional()
  @IsString()
  coatingLot1?: string;

  @ApiPropertyOptional({ description: '프레스 LOT 1차', example: 'PRESS-001' })
  @IsOptional()
  @IsString()
  pressLot1?: string;

  @ApiPropertyOptional({ description: '코팅 수량 1차', example: 1000 })
  @IsOptional()
  @IsNumber()
  coatingQuantity1?: number;

  @ApiPropertyOptional({ description: '프레스 수량 1차', example: 950 })
  @IsOptional()
  @IsNumber()
  pressQuantity1?: number;

  @ApiPropertyOptional({ description: '면적밀도 전단 M 1차', example: 25 })
  @IsOptional()
  @IsNumber()
  weightPerAreaFront1M?: number;

  @ApiPropertyOptional({ description: '면적밀도 전단 C 1차', example: 25 })
  @IsOptional()
  @IsNumber()
  weightPerAreaFront1C?: number;

  @ApiPropertyOptional({ description: '면적밀도 전단 D 1차', example: 25 })
  @IsOptional()
  @IsNumber()
  weightPerAreaFront1D?: number;

  @ApiPropertyOptional({ description: '면적밀도 후단 M 1차', example: 25 })
  @IsOptional()
  @IsNumber()
  weightPerAreaRear1M?: number;

  @ApiPropertyOptional({ description: '면적밀도 후단 C 1차', example: 25 })
  @IsOptional()
  @IsNumber()
  weightPerAreaRear1C?: number;

  @ApiPropertyOptional({ description: '면적밀도 후단 D 1차', example: 25 })
  @IsOptional()
  @IsNumber()
  weightPerAreaRear1D?: number;

  @ApiPropertyOptional({ description: '두께 전단 M 1차', example: 100 })
  @IsOptional()
  @IsNumber()
  thicknessFront1M?: number;

  @ApiPropertyOptional({ description: '두께 전단 C 1차', example: 100 })
  @IsOptional()
  @IsNumber()
  thicknessFront1C?: number;

  @ApiPropertyOptional({ description: '두께 전단 D 1차', example: 100 })
  @IsOptional()
  @IsNumber()
  thicknessFront1D?: number;

  @ApiPropertyOptional({ description: '두께 후단 M 1차', example: 100 })
  @IsOptional()
  @IsNumber()
  thicknessRear1M?: number;

  @ApiPropertyOptional({ description: '두께 후단 C 1차', example: 100 })
  @IsOptional()
  @IsNumber()
  thicknessRear1C?: number;

  @ApiPropertyOptional({ description: '두께 후단 D 1차', example: 100 })
  @IsOptional()
  @IsNumber()
  thicknessRear1D?: number;

  // B. 생산 정보 2차
  @ApiPropertyOptional({ description: '코팅 LOT 2차' })
  @IsOptional()
  @IsString()
  coatingLot2?: string;

  @ApiPropertyOptional({ description: '프레스 LOT 2차' })
  @IsOptional()
  @IsString()
  pressLot2?: string;

  @ApiPropertyOptional({ description: '코팅 수량 2차' })
  @IsOptional()
  @IsNumber()
  coatingQuantity2?: number;

  @ApiPropertyOptional({ description: '프레스 수량 2차' })
  @IsOptional()
  @IsNumber()
  pressQuantity2?: number;

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

  // B. 생산 정보 3차
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coatingLot3?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pressLot3?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  coatingQuantity3?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  pressQuantity3?: number;

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

  // B. 생산 정보 4차
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coatingLot4?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pressLot4?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  coatingQuantity4?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  pressQuantity4?: number;

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

  // B. 생산 정보 5차
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coatingLot5?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pressLot5?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  coatingQuantity5?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  pressQuantity5?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  weightPerAreaFront5M?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  weightPerAreaFront5C?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  weightPerAreaFront5D?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  weightPerAreaRear5M?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  weightPerAreaRear5C?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  weightPerAreaRear5D?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  thicknessFront5M?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  thicknessFront5C?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  thicknessFront5D?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  thicknessRear5M?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  thicknessRear5C?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  thicknessRear5D?: number;

  // C. 공정 조건
  @ApiPropertyOptional({ description: '장력 UnT', example: 50 })
  @IsOptional()
  @IsNumber()
  tensionUnT?: number;

  @ApiPropertyOptional({ description: '장력 ReT', example: 50 })
  @IsOptional()
  @IsNumber()
  tensionReT?: number;

  @ApiPropertyOptional({ description: '프레스 속도', example: 10 })
  @IsOptional()
  @IsNumber()
  pressSpeed?: number;

  @ApiPropertyOptional({ description: '압력 조건', example: 100 })
  @IsOptional()
  @IsNumber()
  pressureCondition?: number;

  @ApiPropertyOptional({ description: 'Roll Gap 좌', example: 50 })
  @IsOptional()
  @IsNumber()
  rollGapLeft?: number;

  @ApiPropertyOptional({ description: 'Roll Gap 우', example: 50 })
  @IsOptional()
  @IsNumber()
  rollGapRight?: number;

  @ApiPropertyOptional({ description: 'Roll 온도 Main', example: 80 })
  @IsOptional()
  @IsNumber()
  rollTemperatureMain?: number;

  @ApiPropertyOptional({ description: 'Roll 온도 Infeed', example: 80 })
  @IsOptional()
  @IsNumber()
  rollTemperatureInfeed?: number;
}

export class UpdatePressWorklogDto extends PartialType(CreatePressWorklogDto) {}

export class PressWorklogListResponseDto extends BaseWorklogListResponseDto {}
