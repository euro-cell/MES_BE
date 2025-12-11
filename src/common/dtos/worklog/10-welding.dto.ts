import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { BaseWorklogDto, BaseWorklogListResponseDto } from './00-base-worklog.dto';

export class CreateWeldingWorklogDto extends BaseWorklogDto {
  // ===== A. 자재 투입 정보 =====

  // 리드탭
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  leadTabLot?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  leadTabManufacturer?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  leadTabSpec?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  leadTabUsage?: number;

  // PI 테이프
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  piTapeLot?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  piTapeManufacturer?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  piTapeSpec?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  piTapeUsage?: number;

  // ===== B. 생산 정보 =====

  // 프리웰딩
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preWeldingJrNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  preWeldingWorkQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  preWeldingGoodQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  preWeldingDefectQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  preWeldingDiscardQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  preWeldingDefectRate?: number;

  // 메인웰딩
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mainWeldingJrNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  mainWeldingWorkQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  mainWeldingGoodQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  mainWeldingDefectQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  mainWeldingDiscardQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  mainWeldingDefectRate?: number;

  // 하이팟2
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hipot2JrNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  hipot2WorkQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  hipot2GoodQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  hipot2DefectQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  hipot2DiscardQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  hipot2DefectRate?: number;

  // 테이핑
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tapingJrNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  tapingWorkQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  tapingGoodQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  tapingDefectQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  tapingDiscardQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  tapingDefectRate?: number;

  // ===== C. 공정 조건 =====

  // 프리웰딩
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  preWeldingEnergy?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  preWeldingAmplitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  preWeldingStopper?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  preWeldingPressure?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  preWeldingHoldTime?: number;

  // 메인웰딩
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  mainWeldingEnergy?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  mainWeldingAmplitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  mainWeldingStopper?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  mainWeldingPressure?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  mainWeldingHoldTime?: number;

  // 하이팟2
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  hipot2Voltage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  hipot2Time?: number;
}

export class UpdateWeldingWorklogDto extends PartialType(CreateWeldingWorklogDto) {}

export class WeldingWorklogListResponseDto extends BaseWorklogListResponseDto {}
