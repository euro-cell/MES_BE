import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { BaseWorklogDto, BaseWorklogListResponseDto } from './00-base-worklog.dto';

export class CreateNotchingWorklogDto extends BaseWorklogDto {
  // A. 자재 투입 정보
  @ApiPropertyOptional({ description: '프레스 롤 LOT 1', example: 'PRESS-ROLL-001' })
  @IsOptional()
  @IsString()
  pressRollLot1?: string;

  @ApiPropertyOptional({ description: '프레스 롤 LOT 2', example: 'PRESS-ROLL-002' })
  @IsOptional()
  @IsString()
  pressRollLot2?: string;

  @ApiPropertyOptional({ description: '프레스 롤 LOT 3', example: 'PRESS-ROLL-003' })
  @IsOptional()
  @IsString()
  pressRollLot3?: string;

  @ApiPropertyOptional({ description: '프레스 롤 LOT 4', example: 'PRESS-ROLL-004' })
  @IsOptional()
  @IsString()
  pressRollLot4?: string;

  @ApiPropertyOptional({ description: '프레스 롤 LOT 5', example: 'PRESS-ROLL-005' })
  @IsOptional()
  @IsString()
  pressRollLot5?: string;

  // B. 생산 정보 1차
  @ApiPropertyOptional({ description: '프레스 LOT 1차', example: 'PRESS-001' })
  @IsOptional()
  @IsString()
  pressLot1?: string;

  @ApiPropertyOptional({ description: '프레스 수량 1차', example: 1000 })
  @IsOptional()
  @IsNumber()
  pressQuantity1?: number;

  @ApiPropertyOptional({ description: '노칭 LOT 1차', example: 'NOTCH-001' })
  @IsOptional()
  @IsString()
  notchingLot1?: string;

  @ApiPropertyOptional({ description: '노칭 수량 1차', example: 950 })
  @IsOptional()
  @IsNumber()
  notchingQuantity1?: number;

  @ApiPropertyOptional({ description: '불량 수량 1차', example: 10 })
  @IsOptional()
  @IsNumber()
  defectQuantity1?: number;

  @ApiPropertyOptional({ description: '양품 수량 1차', example: 940 })
  @IsOptional()
  @IsNumber()
  goodQuantity1?: number;

  @ApiPropertyOptional({ description: '치수 불량 1차', example: 2 })
  @IsOptional()
  @IsNumber()
  dimension1?: number;

  @ApiPropertyOptional({ description: '버 불량 1차', example: 1 })
  @IsOptional()
  @IsNumber()
  burr1?: number;

  @ApiPropertyOptional({ description: '손상 불량 1차', example: 1 })
  @IsOptional()
  @IsNumber()
  damage1?: number;

  @ApiPropertyOptional({ description: '미절단 불량 1차', example: 2 })
  @IsOptional()
  @IsNumber()
  nonCutting1?: number;

  @ApiPropertyOptional({ description: '과탭 불량 1차', example: 1 })
  @IsOptional()
  @IsNumber()
  overTab1?: number;

  @ApiPropertyOptional({ description: '폭 불량 1차', example: 1 })
  @IsOptional()
  @IsNumber()
  wide1?: number;

  @ApiPropertyOptional({ description: '길이 불량 1차', example: 1 })
  @IsOptional()
  @IsNumber()
  length1?: number;

  @ApiPropertyOptional({ description: '미스매치 불량 1차', example: 1 })
  @IsOptional()
  @IsNumber()
  missMatch1?: number;

  // B. 생산 정보 2차
  @ApiPropertyOptional({ description: '프레스 LOT 2차' })
  @IsOptional()
  @IsString()
  pressLot2?: string;

  @ApiPropertyOptional({ description: '프레스 수량 2차' })
  @IsOptional()
  @IsNumber()
  pressQuantity2?: number;

  @ApiPropertyOptional({ description: '노칭 LOT 2차' })
  @IsOptional()
  @IsString()
  notchingLot2?: string;

  @ApiPropertyOptional({ description: '노칭 수량 2차' })
  @IsOptional()
  @IsNumber()
  notchingQuantity2?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  defectQuantity2?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  goodQuantity2?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  dimension2?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  burr2?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  damage2?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  nonCutting2?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  overTab2?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  wide2?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  length2?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  missMatch2?: number;

  // B. 생산 정보 3차
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pressLot3?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  pressQuantity3?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notchingLot3?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  notchingQuantity3?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  defectQuantity3?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  goodQuantity3?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  dimension3?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  burr3?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  damage3?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  nonCutting3?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  overTab3?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  wide3?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  length3?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  missMatch3?: number;

  // B. 생산 정보 4차
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pressLot4?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notchingLot4?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  pressQuantity4?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  notchingQuantity4?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  defectQuantity4?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  goodQuantity4?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  dimension4?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  burr4?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  damage4?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  nonCutting4?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  overTab4?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  wide4?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  length4?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  missMatch4?: number;

  // B. 생산 정보 5차
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pressLot5?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notchingLot5?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  pressQuantity5?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  notchingQuantity5?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  defectQuantity5?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  goodQuantity5?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  dimension5?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  burr5?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  damage5?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  nonCutting5?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  overTab5?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  wide5?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  length5?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  missMatch5?: number;

  // C. 공정 조건
  @ApiPropertyOptional({ description: '장력', example: 50 })
  @IsOptional()
  @IsNumber()
  tension?: number;

  @ApiPropertyOptional({ description: '펀칭 속도', example: 100 })
  @IsOptional()
  @IsNumber()
  punchingSpeed?: number;
}

export class UpdateNotchingWorklogDto extends PartialType(CreateNotchingWorklogDto) {}

export class NotchingWorklogListResponseDto extends BaseWorklogListResponseDto {}
