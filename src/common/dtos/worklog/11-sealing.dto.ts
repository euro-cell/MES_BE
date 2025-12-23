import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { BaseWorklogDto, BaseWorklogListResponseDto } from './00-base-worklog.dto';

export class CreateSealingWorklogDto extends BaseWorklogDto {
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
  @IsNumber()
  pouchDepth?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pouchInputQuantity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pouchUsage?: string;

  // ===== B. 생산 정보 =====

  // 탑
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  topJrNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  topWorkQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  topGoodQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  topDefectQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  topDiscardQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  topDefectRate?: number;

  // 사이드
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sideJrNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  sideWorkQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  sideGoodQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  sideDefectQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  sideDiscardQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  sideDefectRate?: number;

  // 하이팟3
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hipot3JrNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  hipot3WorkQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  hipot3GoodQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  hipot3DefectQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  hipot3DiscardQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  hipot3DefectRate?: number;

  // ===== C. 공정 조건 =====

  // 탑
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  topUpperTemperature?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  topLowerTemperature?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  topPressureLeft?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  topPressureCenter?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  topPressureRight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  topSealingTime?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  topChecklist?: string;

  // 사이드
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  sideUpperTemperature?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  sideLowerTemperature?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  sidePressureLeft?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  sidePressureCenter?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  sidePressureRight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  sideSealingTime?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sideChecklist?: string;

  // 바텀
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  bottomUpperTemperature?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  bottomLowerTemperature?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  bottomPressureLeft?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  bottomPressureCenter?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  bottomPressureRight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  bottomSealingTime?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bottomChecklist?: string;

  // 하이팟3
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  hipot3Voltage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  hipot3Time?: number;

  // ===== D. 비고 =====

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarkTop?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarkSide?: string;
}

export class UpdateSealingWorklogDto extends PartialType(CreateSealingWorklogDto) {}

export class SealingWorklogListResponseDto extends BaseWorklogListResponseDto {}
