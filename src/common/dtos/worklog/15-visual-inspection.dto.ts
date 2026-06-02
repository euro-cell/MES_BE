import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { BaseWorklogDto, BaseWorklogListResponseDto } from './00-base-worklog.dto';

export class CreateVisualInspectionWorklogDto extends BaseWorklogDto {
  // ===== A. 자재 투입 정보 =====

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cellNumberRange?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  cellInputQuantity?: number;

  // ===== B. 생산 정보 =====

  // 가스 발생
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  gasDiscardQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gasDefectRemark?: string;

  // 이물질 외관
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  foreignMatterDiscardQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  foreignMatterDefectRemark?: string;

  // 긁힘
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  scratchDiscardQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  scratchDefectRemark?: string;

  // 찍힘
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  dentDiscardQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dentDefectRemark?: string;

  // 누액 및 부식
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  leakCorrosionDiscardQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  leakCorrosionDefectRemark?: string;

  // 전지 크기 > 폭
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  cellSizeWidthDiscardQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cellSizeWidthDefectRemark?: string;

  // 전지 크기 > 길이
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  cellSizeLengthDiscardQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cellSizeLengthDefectRemark?: string;

  // 전지 크기 > 두께
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  cellSizeThicknessDiscardQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cellSizeThicknessDefectRemark?: string;

  // 무게
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  cellWeightDiscardQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cellWeightDefectRemark?: string;
}

export class UpdateVisualInspectionWorklogDto extends PartialType(CreateVisualInspectionWorklogDto) {}

export class VisualInspectionWorklogListResponseDto extends BaseWorklogListResponseDto {}
