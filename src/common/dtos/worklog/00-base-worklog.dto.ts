import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsNumber } from 'class-validator';

export class BaseWorklogDto {
  @ApiProperty({ description: '제조 일자', example: '2025-12-01' })
  @IsDateString()
  manufactureDate: string;

  @ApiProperty({ description: '작업자', example: '박호언' })
  @IsString()
  worker: string;

  @ApiProperty({ description: '라인명', example: '믹싱 라인' })
  @IsString()
  line: string;

  @ApiPropertyOptional({ description: '설비 ID', example: 24 })
  @IsOptional()
  @IsNumber()
  plant?: number;

  @ApiProperty({ description: 'shift', example: '1 shift' })
  @IsString()
  shift: string;

  @ApiPropertyOptional({ description: '설비 점검 결과', example: '양호' })
  @IsOptional()
  @IsString()
  equipmentCheckResult?: string;

  @ApiPropertyOptional({ description: '지그 번호', example: 'JIG-001' })
  @IsOptional()
  @IsString()
  jigNumber?: string;

  @ApiPropertyOptional({ description: '설비 이상 유무', example: '없음' })
  @IsOptional()
  @IsString()
  equipmentIssue?: string;

  @ApiPropertyOptional({ description: '온습도', example: '25°C / 50%' })
  @IsOptional()
  @IsString()
  tempHumi?: string;

  @ApiPropertyOptional({ description: '청결 점검', example: '양호' })
  @IsOptional()
  @IsString()
  cleanCheck?: string;

  @ApiPropertyOptional({ description: '안전 점검', example: '이상없음' })
  @IsOptional()
  @IsString()
  safety?: string;

  @ApiPropertyOptional({ description: '비고', example: null })
  @IsOptional()
  @IsString()
  remark?: string;

  @ApiPropertyOptional({ description: '작성자', example: '홍길동' })
  @IsOptional()
  @IsString()
  writer?: string;

  @ApiPropertyOptional({ description: '검토자', example: '김철수' })
  @IsOptional()
  @IsString()
  reviewer?: string;

  @ApiPropertyOptional({ description: '승인자', example: '이영희' })
  @IsOptional()
  @IsString()
  approver?: string;
}

export class BaseWorklogListResponseDto {
  @ApiProperty({ description: 'ID', example: 1 })
  id: number;

  @ApiProperty({ description: '작업일 (제조일자)', example: '2025-12-01' })
  workDate: string;

  @ApiProperty({ description: '회차', example: 1 })
  round: number;

  @ApiProperty({ description: '작성자', example: '박호언' })
  writer: string;
}
