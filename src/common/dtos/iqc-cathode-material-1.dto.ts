import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateIQCCathodeMaterial1ResultDto {
  @ApiProperty({ description: '검사 항목명' })
  @IsString()
  item: string;

  @ApiProperty({ required: false, description: '기준' })
  @IsOptional()
  @IsString()
  standard?: string;

  @ApiProperty({ required: false, description: '결과값' })
  @IsOptional()
  @IsString()
  result?: string;

  @ApiProperty({ default: true, description: '합부판정 (true: 합격, false: 불합격)' })
  @IsBoolean()
  pass: boolean;
}

export class CreateIQCCathodeMaterial1ImageDto {
  @ApiProperty({ description: '이미지 URL' })
  @IsString()
  imageUrl: string;
}

export class CreateIQCCathodeMaterial1Dto {
  @ApiProperty({ required: false, description: '검사일 (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  inspectionDate?: string;

  @ApiProperty({ required: false, description: 'Lot 번호' })
  @IsOptional()
  @IsString()
  lot?: string;

  @ApiProperty({ required: false, description: '제조사' })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiProperty({ required: false, description: 'CoA 참조' })
  @IsOptional()
  @IsString()
  coaReference?: string;

  @ApiProperty({ required: false, description: '비고' })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiProperty({
    type: [CreateIQCCathodeMaterial1ResultDto],
    required: false,
    description: '검사 결과 목록',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateIQCCathodeMaterial1ResultDto)
  results?: CreateIQCCathodeMaterial1ResultDto[];

  @ApiProperty({
    type: [CreateIQCCathodeMaterial1ImageDto],
    required: false,
    description: '검사 이미지 목록',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateIQCCathodeMaterial1ImageDto)
  images?: CreateIQCCathodeMaterial1ImageDto[];
}

export class UpdateIQCCathodeMaterial1Dto extends CreateIQCCathodeMaterial1Dto {}
