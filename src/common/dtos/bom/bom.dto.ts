import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BomClassification, BomCurrency } from 'src/common/entities/bom/bom-template-row.entity';

export class CreateBomTemplateRowDto {
  @ApiProperty({ enum: BomClassification, description: '분류 (Cathode | Anode | Ass\'y)' })
  @IsEnum(BomClassification)
  classification: BomClassification;

  @ApiProperty({ description: '자재 ID' })
  @IsNumber()
  materialId: number;

  @ApiPropertyOptional({ description: '수율 (%)' })
  @IsOptional()
  @IsNumber()
  yieldRate?: number;

  @ApiProperty({ enum: BomCurrency, description: '통화' })
  @IsEnum(BomCurrency)
  currency: BomCurrency;

  @ApiPropertyOptional({ description: '구매 가격' })
  @IsOptional()
  @IsNumber()
  purchasePrice?: number;

  @ApiPropertyOptional({ description: '관세 (%)' })
  @IsOptional()
  @IsNumber()
  tariff?: number;

  @ApiPropertyOptional({ description: '기타 부대비용 (%)' })
  @IsOptional()
  @IsNumber()
  etc?: number;

  @ApiProperty({ description: '순소요량 (셀 1개당)' })
  @IsNumber()
  netQty: number;
}

export class CreateBomTemplateDto {
  @ApiProperty({ description: 'BOM 템플릿 이름' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '설명' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'USD 환율' })
  @IsOptional()
  @IsNumber()
  usdRate?: number;

  @ApiPropertyOptional({ description: 'JPY 환율' })
  @IsOptional()
  @IsNumber()
  jpyRate?: number;

  @ApiPropertyOptional({ description: 'EUR 환율' })
  @IsOptional()
  @IsNumber()
  eurRate?: number;

  @ApiProperty({ type: [CreateBomTemplateRowDto], description: 'BOM 행 목록' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateBomTemplateRowDto)
  rows: CreateBomTemplateRowDto[];
}

export class UpdateBomTemplateDto {
  @ApiPropertyOptional({ description: 'BOM 템플릿 이름' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '설명' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'USD 환율' })
  @IsOptional()
  @IsNumber()
  usdRate?: number;

  @ApiPropertyOptional({ description: 'JPY 환율' })
  @IsOptional()
  @IsNumber()
  jpyRate?: number;

  @ApiPropertyOptional({ description: 'EUR 환율' })
  @IsOptional()
  @IsNumber()
  eurRate?: number;

  @ApiPropertyOptional({ type: [CreateBomTemplateRowDto], description: 'BOM 행 목록 (전체 교체)' })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateBomTemplateRowDto)
  rows?: CreateBomTemplateRowDto[];
}

export class LinkBomTemplateDto {
  @ApiProperty({ description: '연결할 BOM 템플릿 ID' })
  @IsNumber()
  templateId: number;
}
