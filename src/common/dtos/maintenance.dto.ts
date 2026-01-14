import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsDateString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMaintenanceDto {
  @ApiProperty({ description: '설비 ID', example: 1 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  equipmentId: number;

  @ApiProperty({ description: '점검일자', example: '2024-01-15' })
  @IsNotEmpty()
  @IsDateString()
  inspectionDate: string;

  @ApiProperty({ description: '교체 이력', example: '베어링 교체' })
  @IsNotEmpty()
  @IsString()
  replacementHistory: string;

  @ApiProperty({ description: '사용 부품', example: '베어링 SKF-6205' })
  @IsNotEmpty()
  @IsString()
  usedParts: string;

  @ApiProperty({ description: '보수자', example: '김철수' })
  @IsNotEmpty()
  @IsString()
  maintainer: string;

  @ApiProperty({ description: '확인자', example: '박영희' })
  @IsNotEmpty()
  @IsString()
  verifier: string;

  @ApiPropertyOptional({ description: '비고' })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateMaintenanceDto extends PartialType(CreateMaintenanceDto) {}

export class MaintenanceResponseDto {
  @ApiProperty({ description: 'ID' })
  id: number;

  @ApiProperty({ description: '설비 ID' })
  equipmentId: number;

  @ApiProperty({ description: '자산번호' })
  assetNo: string;

  @ApiProperty({ description: '설비번호' })
  equipmentNo: string;

  @ApiProperty({ description: '설비명' })
  equipmentName: string;

  @ApiProperty({ description: '점검일자' })
  inspectionDate: Date;

  @ApiProperty({ description: '교체 이력' })
  replacementHistory: string;

  @ApiProperty({ description: '사용 부품' })
  usedParts: string;

  @ApiProperty({ description: '보수자' })
  maintainer: string;

  @ApiProperty({ description: '확인자' })
  verifier: string;

  @ApiPropertyOptional({ description: '비고' })
  remark?: string;
}
