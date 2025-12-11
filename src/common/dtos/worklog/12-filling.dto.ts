import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { BaseWorklogDto, BaseWorklogListResponseDto } from './00-base-worklog.dto';

export class CreateFillingWorklogDto extends BaseWorklogDto {
  // ===== A. 자재 투입 정보 =====

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  electrolyteLot?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  electrolyteManufacturer?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  electrolyteSpec?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  electrolyteUsage?: number;

  // ===== B. 생산 정보 =====

  // 필링
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  fillingWorkQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  fillingGoodQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  fillingDefectQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  fillingDiscardQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  fillingDefectRate?: number;

  // 웨이팅
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  waitingWorkQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  waitingGoodQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  waitingDefectQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  waitingDiscardQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  waitingDefectRate?: number;

  // ===== C. 공정 조건 =====

  // 필링
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  fillingEquipmentInjectionAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  fillingSpecInjectionAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  fillingInjectionSpeed?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  fillingSpecificGravity?: number;

  // 웨이팅 구분 1
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  waiting1RepeatCount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  waiting1PressureRange?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  waiting1HoldTime?: number;

  // 웨이팅 구분 2
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  waiting2RepeatCount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  waiting2PressureRange?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  waiting2HoldTime?: number;

  // 웨이팅 구분 3
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  waiting3RepeatCount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  waiting3PressureRange?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  waiting3HoldTime?: number;
}

export class UpdateFillingWorklogDto extends PartialType(CreateFillingWorklogDto) {}

export class FillingWorklogListResponseDto extends BaseWorklogListResponseDto {}
