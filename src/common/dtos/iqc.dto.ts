import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsArray,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PsdDataItemDto {
  @ApiProperty({ description: '입자 크기 (㎛)' })
  @IsNumber()
  size: number;

  @ApiProperty({ description: '부피 비율 (%)' })
  @IsNumber()
  volumeIn: number;
}

export class CreateIQCResultDto {
  @ApiProperty({ description: '검사 카테고리 (입도, 수분, Half cell ...)' })
  @IsString()
  category: string;

  @ApiProperty({ required: false, description: '세부 항목 (D50, 0.1C ...)' })
  @IsOptional()
  @IsString()
  item?: string;

  @ApiProperty({ required: false, description: '단위 (㎛, ppm ...)' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({ required: false, description: '규격 (7.7±1.0, ≥185.0 ...)' })
  @IsOptional()
  @IsString()
  spec?: string;

  @ApiProperty({ required: false, description: 'CoA 기재값' })
  @IsOptional()
  @IsString()
  refCoa?: string;

  @ApiProperty({ required: false, description: '직전 Lot 실측값' })
  @IsOptional()
  @IsNumber()
  refLastData?: number;

  @ApiProperty({ required: false, description: '샘플1 측정값' })
  @IsOptional()
  @IsNumber()
  sample1?: number;

  @ApiProperty({ required: false, description: '샘플2 측정값' })
  @IsOptional()
  @IsNumber()
  sample2?: number;

  @ApiProperty({ required: false, description: '샘플3 측정값' })
  @IsOptional()
  @IsNumber()
  sample3?: number;

  @ApiProperty({ description: '항목별 합불 (true: 합격, false: 불합격)' })
  @IsBoolean()
  isPassed: boolean;

  @ApiProperty({ required: false, description: '비고 (조건, 전압범위 등)' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateIQCCoaRefDto {
  @ApiProperty({ description: 'CoA 항목명 (BET(㎡/g), Fe(ppm) ...)' })
  @IsString()
  attrName: string;

  @ApiProperty({ required: false, description: 'CoA 항목값' })
  @IsOptional()
  @IsString()
  attrValue?: string;
}

export class CreateIQCImageDto {
  @ApiProperty({ description: '이미지 종류 (PSD / Half cell / FE-SEM)' })
  @IsString()
  imageType: string;

  @ApiProperty({ required: false, description: '파일 경로 또는 S3 URL' })
  @IsOptional()
  @IsString()
  filePath?: string;
}

export class CreateIQCDto {
  @ApiProperty({ description: '소재 대분류 (양극재, 음극재 ...)' })
  @IsString()
  category: string;

  @ApiProperty({ description: '품목 코드 (NCM622, LCO ...)' })
  @IsString()
  type: string;

  @ApiProperty({ description: '품명 (NCM-622, Super P Li ...)' })
  @IsString()
  name: string;

  @ApiProperty({ required: false, description: '제조원' })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiProperty({ description: 'Lot 번호' })
  @IsString()
  lotNo: string;

  @ApiProperty({ required: false, description: '사용처' })
  @IsOptional()
  @IsString()
  usage?: string;

  @ApiProperty({ required: false, description: '입고일 (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  receiptDate?: string;

  @ApiProperty({ required: false, description: '검사일 (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  inspectionDate?: string;

  @ApiProperty({ required: false, description: '검사자' })
  @IsOptional()
  @IsString()
  inspector?: string;

  @ApiProperty({ required: false, description: '최종 합불 (true: 합격, false: 불합격)', default: true })
  @IsOptional()
  @IsBoolean()
  isPassed?: boolean;

  @ApiProperty({ required: false, description: '비고' })
  @IsOptional()
  @IsString()
  remark?: string;

  @ApiProperty({ type: [PsdDataItemDto], required: false, description: 'PSD Raw Data (빈 배열이면 초기화)' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PsdDataItemDto)
  psdData?: PsdDataItemDto[];

  @ApiProperty({ type: [CreateIQCResultDto], required: false, description: '검사 결과 목록' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateIQCResultDto)
  results?: CreateIQCResultDto[];

  @ApiProperty({ type: [CreateIQCCoaRefDto], required: false, description: 'CoA 참조 항목 목록' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateIQCCoaRefDto)
  coaRefs?: CreateIQCCoaRefDto[];

  @ApiProperty({ type: [CreateIQCImageDto], required: false, description: '이미지 목록' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateIQCImageDto)
  images?: CreateIQCImageDto[];
}

export class UpdateIQCDto extends PartialType(CreateIQCDto) {}

export class UploadIQCImagesDto {
  @ApiProperty({ description: '이미지 종류 (PSD / Half cell / FE-SEM)' })
  @IsString()
  imageType: string;
}
