import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString } from 'class-validator';

// Summary 생성/수정용 DTO (프로젝트 개요 및 특이사항만 수동 입력)
export class CreateIQCSummaryDto {
  @ApiProperty({ required: false, description: '프로젝트 개요' })
  @IsOptional()
  @IsString()
  projectOverview?: string;

  @ApiProperty({ required: false, description: '특이사항' })
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class UpdateIQCSummaryDto extends PartialType(CreateIQCSummaryDto) {}

export class CreateIQCListItemDto {
  @ApiProperty({ description: '구분' })
  @IsString()
  category: string;

  @ApiProperty({ required: false, description: '기준' })
  @IsOptional()
  @IsString()
  standard?: string;

  @ApiProperty({ required: false, description: '결과 (합격/불합격 등)' })
  @IsOptional()
  @IsString()
  result?: string;

  @ApiProperty({ required: false, description: '검사자' })
  @IsOptional()
  @IsString()
  inspector?: string;

  @ApiProperty({ required: false, description: '검사일 (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  inspectionDate?: string;
}

export class UpdateIQCListItemDto extends PartialType(CreateIQCListItemDto) {}
