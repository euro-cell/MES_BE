import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { BaseWorklogDto, BaseWorklogListResponseDto } from './00-base-worklog.dto';

export class CreateStackingWorklogDto extends BaseWorklogDto {
  // ===== A. 자재 투입 정보 =====

  // 분리막
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  separatorLot?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  separatorManufacturer?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  separatorSpec?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  separatorInputQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  separatorUsage?: number;

  // 양극 매거진 LOT 1~3
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

  // 음극 매거진 LOT 1~3
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

  // ===== B. 생산 정보 =====

  // 스택 생산
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  stackProductionWorkQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  stackProductionGoodQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  stackProductionDefectQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  stackProductionDiscardQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  stackProductionDefectRate?: number;

  // HiPot1
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  hipot1WorkQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  hipot1GoodQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  hipot1DefectQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  hipot1DiscardQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  hipot1DefectRate?: number;

  // JR Number 1
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber1?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber1Range?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber1CathodeLot?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber1AnodeLot?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber1SeparatorLot?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber1WorkTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  jrNumber1ElectrodeDefect?: number;

  // JR Number 2
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber2?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber2Range?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber2CathodeLot?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber2AnodeLot?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber2SeparatorLot?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber2WorkTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  jrNumber2ElectrodeDefect?: number;

  // JR Number 3
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber3?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber3Range?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber3CathodeLot?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber3AnodeLot?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber3SeparatorLot?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber3WorkTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  jrNumber3ElectrodeDefect?: number;

  // JR Number 4
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber4?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber4Range?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber4CathodeLot?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber4AnodeLot?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber4SeparatorLot?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber4WorkTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  jrNumber4ElectrodeDefect?: number;

  // ===== C. 공정 조건 =====

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  jellyRollWeight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  jellyRollThickness?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  separatorWidth?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  separatorLength?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  stackCount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  hipot1Voltage?: number;
}

export class UpdateStackingWorklogDto extends PartialType(CreateStackingWorklogDto) {}

export class StackingWorklogListResponseDto extends BaseWorklogListResponseDto {}
