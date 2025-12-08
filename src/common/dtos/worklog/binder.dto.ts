import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreateBinderWorklogDto {
  @ApiProperty({ description: '제조 일자', example: '2025-12-01' })
  @IsDateString()
  manufactureDate: string;

  @ApiProperty({ description: '작업자', example: '박호언' })
  @IsString()
  worker: string;

  @ApiProperty({ description: '라인명', example: '믹싱 라인' })
  @IsString()
  line: string;

  @ApiProperty({ description: '설비명', example: 'Mixer 20L' })
  @IsString()
  plant: string;

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

  @ApiPropertyOptional({ description: '원료1 명칭', example: 'PVDF' })
  @IsOptional()
  @IsString()
  material1Name?: string;

  @ApiPropertyOptional({ description: '원료1 조성', example: 8.5 })
  @IsOptional()
  @IsNumber()
  material1Composition?: number;

  @ApiPropertyOptional({ description: '원료1 LOT', example: 'LOT-2024-001' })
  @IsOptional()
  @IsString()
  material1Lot?: string;

  @ApiPropertyOptional({ description: '원료1 투입계획', example: 1000.5 })
  @IsOptional()
  @IsNumber()
  material1PlannedInput?: number;

  @ApiPropertyOptional({ description: '원료1 투입실적', example: 998.3 })
  @IsOptional()
  @IsNumber()
  material1ActualInput?: number;

  @ApiPropertyOptional({ description: '원료2 명칭', example: 'NMP' })
  @IsOptional()
  @IsString()
  material2Name?: string;

  @ApiPropertyOptional({ description: '원료2 조성', example: 91.5 })
  @IsOptional()
  @IsNumber()
  material2Composition?: number;

  @ApiPropertyOptional({ description: '원료2 LOT', example: 'LOT-2024-002' })
  @IsOptional()
  @IsString()
  material2Lot?: string;

  @ApiPropertyOptional({ description: '원료2 투입계획', example: 10750 })
  @IsOptional()
  @IsNumber()
  material2PlannedInput?: number;

  @ApiPropertyOptional({ description: '원료2 투입실적', example: 10745.2 })
  @IsOptional()
  @IsNumber()
  material2ActualInput?: number;

  @ApiPropertyOptional({ description: '바인더 용액', example: 8.5 })
  @IsOptional()
  @IsNumber()
  binderSolution?: number;

  @ApiPropertyOptional({ description: 'LOT', example: 'BINDER-2024-001' })
  @IsOptional()
  @IsString()
  lot?: string;

  @ApiPropertyOptional({ description: '점도', example: 1500 })
  @IsOptional()
  @IsNumber()
  viscosity?: number;

  @ApiPropertyOptional({ description: '고형분1', example: 8.5 })
  @IsOptional()
  @IsNumber()
  solidContent1?: number;

  @ApiPropertyOptional({ description: '고형분2', example: 8.4 })
  @IsOptional()
  @IsNumber()
  solidContent2?: number;

  @ApiPropertyOptional({ description: '고형분3', example: 8.6 })
  @IsOptional()
  @IsNumber()
  solidContent3?: number;

  @ApiPropertyOptional({ description: 'NMP 계량 투입량', example: 5000.5 })
  @IsOptional()
  @IsNumber()
  nmpWeightInput?: number;

  @ApiPropertyOptional({ description: 'NMP 계량 온도', example: 25.5 })
  @IsOptional()
  @IsNumber()
  nmpWeightTemp?: number;

  @ApiPropertyOptional({ description: 'NMP 계량 저속 RPM', example: 100 })
  @IsOptional()
  @IsNumber()
  nmpWeightRpmLow?: number;

  @ApiPropertyOptional({ description: 'NMP 계량 고속 RPM', example: 500 })
  @IsOptional()
  @IsNumber()
  nmpWeightRpmHigh?: number;

  @ApiPropertyOptional({ description: 'NMP 계량 시작 시간', example: '09:00:00' })
  @IsOptional()
  @IsString()
  nmpWeightStartTime?: string;

  @ApiPropertyOptional({ description: 'NMP 계량 종료 시간', example: '09:30:00' })
  @IsOptional()
  @IsString()
  nmpWeightEndTime?: string;

  @ApiPropertyOptional({ description: '바인더 계량 투입량', example: 500.5 })
  @IsOptional()
  @IsNumber()
  binderWeightInput?: number;

  @ApiPropertyOptional({ description: '바인더 계량 온도', example: 25.5 })
  @IsOptional()
  @IsNumber()
  binderWeightTemp?: number;

  @ApiPropertyOptional({ description: '바인더 계량 저속 RPM', example: 100 })
  @IsOptional()
  @IsNumber()
  binderWeightRpmLow?: number;

  @ApiPropertyOptional({ description: '바인더 계량 고속 RPM', example: 500 })
  @IsOptional()
  @IsNumber()
  binderWeightRpmHigh?: number;

  @ApiPropertyOptional({ description: '바인더 계량 시작 시간', example: '09:30:00' })
  @IsOptional()
  @IsString()
  binderWeightStartTime?: string;

  @ApiPropertyOptional({ description: '바인더 계량 종료 시간', example: '10:00:00' })
  @IsOptional()
  @IsString()
  binderWeightEndTime?: string;

  @ApiPropertyOptional({ description: '혼합1 투입량', example: 5500.0 })
  @IsOptional()
  @IsNumber()
  mixing1Input?: number;

  @ApiPropertyOptional({ description: '혼합1 온도', example: 25.5 })
  @IsOptional()
  @IsNumber()
  mixing1Temp?: number;

  @ApiPropertyOptional({ description: '혼합1 저속 RPM', example: 100 })
  @IsOptional()
  @IsNumber()
  mixing1RpmLow?: number;

  @ApiPropertyOptional({ description: '혼합1 고속 RPM', example: 500 })
  @IsOptional()
  @IsNumber()
  mixing1RpmHigh?: number;

  @ApiPropertyOptional({ description: '혼합1 시작 시간', example: '10:00:00' })
  @IsOptional()
  @IsString()
  mixing1StartTime?: string;

  @ApiPropertyOptional({ description: '혼합1 종료 시간', example: '11:00:00' })
  @IsOptional()
  @IsString()
  mixing1EndTime?: string;

  @ApiPropertyOptional({ description: '스크래핑 투입량', example: 5500.0 })
  @IsOptional()
  @IsNumber()
  scrappingInput?: number;

  @ApiPropertyOptional({ description: '스크래핑 온도', example: 25.5 })
  @IsOptional()
  @IsNumber()
  scrappingTemp?: number;

  @ApiPropertyOptional({ description: '스크래핑 저속 RPM', example: 100 })
  @IsOptional()
  @IsNumber()
  scrappingRpmLow?: number;

  @ApiPropertyOptional({ description: '스크래핑 고속 RPM', example: 500 })
  @IsOptional()
  @IsNumber()
  scrappingRpmHigh?: number;

  @ApiPropertyOptional({ description: '스크래핑 시작 시간', example: '11:00:00' })
  @IsOptional()
  @IsString()
  scrappingStartTime?: string;

  @ApiPropertyOptional({ description: '스크래핑 종료 시간', example: '11:30:00' })
  @IsOptional()
  @IsString()
  scrappingEndTime?: string;

  @ApiPropertyOptional({ description: '혼합2 투입량', example: 5500.0 })
  @IsOptional()
  @IsNumber()
  mixing2Input?: number;

  @ApiPropertyOptional({ description: '혼합2 온도', example: 25.5 })
  @IsOptional()
  @IsNumber()
  mixing2Temp?: number;

  @ApiPropertyOptional({ description: '혼합2 저속 RPM', example: 100 })
  @IsOptional()
  @IsNumber()
  mixing2RpmLow?: number;

  @ApiPropertyOptional({ description: '혼합2 고속 RPM', example: 500 })
  @IsOptional()
  @IsNumber()
  mixing2RpmHigh?: number;

  @ApiPropertyOptional({ description: '혼합2 시작 시간', example: '11:30:00' })
  @IsOptional()
  @IsString()
  mixing2StartTime?: string;

  @ApiPropertyOptional({ description: '혼합2 종료 시간', example: '12:30:00' })
  @IsOptional()
  @IsString()
  mixing2EndTime?: string;

  @ApiPropertyOptional({ description: '안정화 투입량', example: 5500.0 })
  @IsOptional()
  @IsNumber()
  stabilizationInput?: number;

  @ApiPropertyOptional({ description: '안정화 온도', example: 25.5 })
  @IsOptional()
  @IsNumber()
  stabilizationTemp?: number;

  @ApiPropertyOptional({ description: '안정화 저속 RPM', example: 100 })
  @IsOptional()
  @IsNumber()
  stabilizationRpmLow?: number;

  @ApiPropertyOptional({ description: '안정화 고속 RPM', example: 500 })
  @IsOptional()
  @IsNumber()
  stabilizationRpmHigh?: number;

  @ApiPropertyOptional({ description: '안정화 시작 시간', example: '12:30:00' })
  @IsOptional()
  @IsString()
  stabilizationStartTime?: string;

  @ApiPropertyOptional({ description: '안정화 종료 시간', example: '13:30:00' })
  @IsOptional()
  @IsString()
  stabilizationEndTime?: string;
}

export class BinderWorklogListResponseDto {
  @ApiProperty({ description: 'ID', example: 1 })
  id: number;

  @ApiProperty({ description: '작업일 (제조일자)', example: '2025-12-01' })
  workDate: string;

  @ApiProperty({ description: '회차', example: 1 })
  round: number;

  @ApiProperty({ description: '작성자', example: '박호언' })
  writer: string;
}
