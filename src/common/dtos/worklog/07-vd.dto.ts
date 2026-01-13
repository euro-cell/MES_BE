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

  // 1차 - 상부
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  upperLot1?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  upperInputQuantity1?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  upperInputOutputTime1?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  upperMoistureMeasurement1?: number;

  // 1차 - 하부
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lowerLot1?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lowerInputQuantity1?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lowerInputOutputTime1?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lowerMoistureMeasurement1?: number;

  // 2차 - 상부
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  upperLot2?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  upperInputQuantity2?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  upperInputOutputTime2?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  upperMoistureMeasurement2?: number;

  // 2차 - 하부
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lowerLot2?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lowerInputQuantity2?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lowerInputOutputTime2?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lowerMoistureMeasurement2?: number;

  // 3차 - 상부
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  upperLot3?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  upperInputQuantity3?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  upperInputOutputTime3?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  upperMoistureMeasurement3?: number;

  // 3차 - 하부
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lowerLot3?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lowerInputQuantity3?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lowerInputOutputTime3?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lowerMoistureMeasurement3?: number;

  // 4차 - 상부
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  upperLot4?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  upperInputQuantity4?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  upperInputOutputTime4?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  upperMoistureMeasurement4?: number;

  // 4차 - 하부
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lowerLot4?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lowerInputQuantity4?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lowerInputOutputTime4?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lowerMoistureMeasurement4?: number;

  // 5차 - 상부
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  upperLot5?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  upperInputQuantity5?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  upperInputOutputTime5?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  upperMoistureMeasurement5?: number;

  // 5차 - 하부
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lowerLot5?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lowerInputQuantity5?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lowerInputOutputTime5?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lowerMoistureMeasurement5?: number;

  // ===== C. 공정 조건 =====

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  vacuumDegreeSetting?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  upperSetTemperature?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lowerSetTemperature?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  upperTimerTime?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lowerTimerTime?: number;
}

export class UpdateVdWorklogDto extends PartialType(CreateVdWorklogDto) {}

export class VdWorklogListResponseDto extends BaseWorklogListResponseDto {}
