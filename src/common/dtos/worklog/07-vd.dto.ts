import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { BaseWorklogDto, BaseWorklogListResponseDto } from './00-base-worklog.dto';

export class CreateVdWorklogDto extends BaseWorklogDto {
  // ===== A. 자재 투입 정보 =====

  // 양극 매거진 LOT 1~5
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cathodeMagazineLot1?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cathodeMagazineLot2?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cathodeMagazineLot3?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cathodeMagazineLot4?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cathodeMagazineLot5?: string;

  // 음극 매거진 LOT 1~5
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  anodeMagazineLot1?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  anodeMagazineLot2?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  anodeMagazineLot3?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  anodeMagazineLot4?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  anodeMagazineLot5?: string;

  // ===== B. 생산 정보 (1~5차) =====

  // 1차 - 양극
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cathodeLot1?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  cathodeInputQuantity1?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cathodeInputOutputTime1?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  cathodeMoistureMeasurement1?: number;

  // 1차 - 음극
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  anodeLot1?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  anodeInputQuantity1?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  anodeInputOutputTime1?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  anodeMoistureMeasurement1?: number;

  // 2차 - 양극
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cathodeLot2?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  cathodeInputQuantity2?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cathodeInputOutputTime2?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  cathodeMoistureMeasurement2?: number;

  // 2차 - 음극
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  anodeLot2?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  anodeInputQuantity2?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  anodeInputOutputTime2?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  anodeMoistureMeasurement2?: number;

  // 3차 - 양극
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cathodeLot3?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  cathodeInputQuantity3?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cathodeInputOutputTime3?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  cathodeMoistureMeasurement3?: number;

  // 3차 - 음극
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  anodeLot3?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  anodeInputQuantity3?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  anodeInputOutputTime3?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  anodeMoistureMeasurement3?: number;

  // 4차 - 양극
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cathodeLot4?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  cathodeInputQuantity4?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cathodeInputOutputTime4?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  cathodeMoistureMeasurement4?: number;

  // 4차 - 음극
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  anodeLot4?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  anodeInputQuantity4?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  anodeInputOutputTime4?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  anodeMoistureMeasurement4?: number;

  // 5차 - 양극
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cathodeLot5?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  cathodeInputQuantity5?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cathodeInputOutputTime5?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  cathodeMoistureMeasurement5?: number;

  // 5차 - 음극
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  anodeLot5?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  anodeInputQuantity5?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  anodeInputOutputTime5?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  anodeMoistureMeasurement5?: number;

  // ===== C. 공정 조건 =====

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  vacuumDegreeSetting?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  cathodeSetTemperature?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  anodeSetTemperature?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  cathodeTimerTime?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  anodeTimerTime?: number;
}

export class UpdateVdWorklogDto extends PartialType(CreateVdWorklogDto) {}

export class VdWorklogListResponseDto extends BaseWorklogListResponseDto {}
