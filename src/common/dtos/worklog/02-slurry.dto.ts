import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreateSlurryWorklogDto {
  @ApiProperty({ description: '제조 일자', example: '2025-12-01' })
  @IsDateString()
  manufactureDate: string;

  @ApiProperty({ description: '작업자', example: '박호언' })
  @IsString()
  worker: string;

  @ApiProperty({ description: '라인명', example: '슬러리 라인' })
  @IsString()
  line: string;

  @ApiProperty({ description: '설비명', example: 'PD Mixer 300L' })
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

  // 원료 1-8
  @ApiPropertyOptional({ description: '원료1 명칭', example: 'NCM' })
  @IsOptional()
  @IsString()
  material1Name?: string;

  @ApiPropertyOptional({ description: '원료1 조성', example: 94.0 })
  @IsOptional()
  @IsNumber()
  material1Composition?: number;

  @ApiPropertyOptional({ description: '원료1 LOT', example: 'NCM-2024-001' })
  @IsOptional()
  @IsString()
  material1Lot?: string;

  @ApiPropertyOptional({ description: '원료1 투입계획', example: 15000.0 })
  @IsOptional()
  @IsNumber()
  material1PlannedInput?: number;

  @ApiPropertyOptional({ description: '원료1 투입실적', example: 14998.5 })
  @IsOptional()
  @IsNumber()
  material1ActualInput?: number;

  @ApiPropertyOptional({ description: '원료2 명칭', example: 'Super-P' })
  @IsOptional()
  @IsString()
  material2Name?: string;

  @ApiPropertyOptional({ description: '원료2 조성', example: 1.5 })
  @IsOptional()
  @IsNumber()
  material2Composition?: number;

  @ApiPropertyOptional({ description: '원료2 LOT', example: 'SP-2024-001' })
  @IsOptional()
  @IsString()
  material2Lot?: string;

  @ApiPropertyOptional({ description: '원료2 투입계획', example: 240.0 })
  @IsOptional()
  @IsNumber()
  material2PlannedInput?: number;

  @ApiPropertyOptional({ description: '원료2 투입실적', example: 239.8 })
  @IsOptional()
  @IsNumber()
  material2ActualInput?: number;

  @ApiPropertyOptional({ description: '원료3 명칭', example: 'CNT' })
  @IsOptional()
  @IsString()
  material3Name?: string;

  @ApiPropertyOptional({ description: '원료3 조성', example: 0.5 })
  @IsOptional()
  @IsNumber()
  material3Composition?: number;

  @ApiPropertyOptional({ description: '원료3 LOT', example: 'CNT-2024-001' })
  @IsOptional()
  @IsString()
  material3Lot?: string;

  @ApiPropertyOptional({ description: '원료3 투입계획', example: 80.0 })
  @IsOptional()
  @IsNumber()
  material3PlannedInput?: number;

  @ApiPropertyOptional({ description: '원료3 투입실적', example: 79.9 })
  @IsOptional()
  @IsNumber()
  material3ActualInput?: number;

  @ApiPropertyOptional({ description: '원료4 명칭', example: 'PVDF' })
  @IsOptional()
  @IsString()
  material4Name?: string;

  @ApiPropertyOptional({ description: '원료4 조성', example: 4.0 })
  @IsOptional()
  @IsNumber()
  material4Composition?: number;

  @ApiPropertyOptional({ description: '원료4 LOT', example: 'PVDF-2024-001' })
  @IsOptional()
  @IsString()
  material4Lot?: string;

  @ApiPropertyOptional({ description: '원료4 투입계획', example: 640.0 })
  @IsOptional()
  @IsNumber()
  material4PlannedInput?: number;

  @ApiPropertyOptional({ description: '원료4 투입실적', example: 639.5 })
  @IsOptional()
  @IsNumber()
  material4ActualInput?: number;

  @ApiPropertyOptional({ description: '원료5 명칭', example: 'NMP' })
  @IsOptional()
  @IsString()
  material5Name?: string;

  @ApiPropertyOptional({ description: '원료5 조성', example: 0.0 })
  @IsOptional()
  @IsNumber()
  material5Composition?: number;

  @ApiPropertyOptional({ description: '원료5 LOT', example: 'NMP-2024-001' })
  @IsOptional()
  @IsString()
  material5Lot?: string;

  @ApiPropertyOptional({ description: '원료5 투입계획', example: 5000.0 })
  @IsOptional()
  @IsNumber()
  material5PlannedInput?: number;

  @ApiPropertyOptional({ description: '원료5 투입실적', example: 4998.0 })
  @IsOptional()
  @IsNumber()
  material5ActualInput?: number;

  @ApiPropertyOptional({ description: '원료6 명칭', example: '' })
  @IsOptional()
  @IsString()
  material6Name?: string;

  @ApiPropertyOptional({ description: '원료6 조성', example: 0.0 })
  @IsOptional()
  @IsNumber()
  material6Composition?: number;

  @ApiPropertyOptional({ description: '원료6 LOT', example: '' })
  @IsOptional()
  @IsString()
  material6Lot?: string;

  @ApiPropertyOptional({ description: '원료6 투입계획', example: 0.0 })
  @IsOptional()
  @IsNumber()
  material6PlannedInput?: number;

  @ApiPropertyOptional({ description: '원료6 투입실적', example: 0.0 })
  @IsOptional()
  @IsNumber()
  material6ActualInput?: number;

  @ApiPropertyOptional({ description: '원료7 명칭', example: '' })
  @IsOptional()
  @IsString()
  material7Name?: string;

  @ApiPropertyOptional({ description: '원료7 조성', example: 0.0 })
  @IsOptional()
  @IsNumber()
  material7Composition?: number;

  @ApiPropertyOptional({ description: '원료7 LOT', example: '' })
  @IsOptional()
  @IsString()
  material7Lot?: string;

  @ApiPropertyOptional({ description: '원료7 투입계획', example: 0.0 })
  @IsOptional()
  @IsNumber()
  material7PlannedInput?: number;

  @ApiPropertyOptional({ description: '원료7 투입실적', example: 0.0 })
  @IsOptional()
  @IsNumber()
  material7ActualInput?: number;

  @ApiPropertyOptional({ description: '원료8 명칭', example: '' })
  @IsOptional()
  @IsString()
  material8Name?: string;

  @ApiPropertyOptional({ description: '원료8 조성', example: 0.0 })
  @IsOptional()
  @IsNumber()
  material8Composition?: number;

  @ApiPropertyOptional({ description: '원료8 LOT', example: '' })
  @IsOptional()
  @IsString()
  material8Lot?: string;

  @ApiPropertyOptional({ description: '원료8 투입계획', example: 0.0 })
  @IsOptional()
  @IsNumber()
  material8PlannedInput?: number;

  @ApiPropertyOptional({ description: '원료8 투입실적', example: 0.0 })
  @IsOptional()
  @IsNumber()
  material8ActualInput?: number;

  // Solid Content
  @ApiPropertyOptional({ description: 'Solid Content', example: 68.5 })
  @IsOptional()
  @IsNumber()
  solidContent?: number;

  // 슬러리 Lot
  @ApiPropertyOptional({ description: '슬러리 LOT', example: 'SLURRY-2024-001' })
  @IsOptional()
  @IsString()
  lot?: string;

  // 점도 측정
  @ApiPropertyOptional({ description: '점도 측정 - 믹싱 후', example: 3500.0 })
  @IsOptional()
  @IsNumber()
  viscosityAfterMixing?: number;

  @ApiPropertyOptional({ description: '점도 측정 - 탈포 후', example: 3450.0 })
  @IsOptional()
  @IsNumber()
  viscosityAfterDefoaming?: number;

  @ApiPropertyOptional({ description: '점도 측정 - 안정화 후', example: 3400.0 })
  @IsOptional()
  @IsNumber()
  viscosityAfterStabilization?: number;

  @ApiPropertyOptional({ description: '점도 측정 4번째 라벨', example: '검사 후' })
  @IsOptional()
  @IsString()
  viscosity4Label?: string;

  @ApiPropertyOptional({ description: '점도 측정 4번째 값', example: 3380.0 })
  @IsOptional()
  @IsNumber()
  viscosity4Value?: number;

  // 고형분 측정 1-3차
  @ApiPropertyOptional({ description: '고형분1 - 접시', example: 15.5 })
  @IsOptional()
  @IsNumber()
  solidContent1Dish?: number;

  @ApiPropertyOptional({ description: '고형분1 - 슬러리', example: 20.3 })
  @IsOptional()
  @IsNumber()
  solidContent1Slurry?: number;

  @ApiPropertyOptional({ description: '고형분1 - 건조', example: 18.8 })
  @IsOptional()
  @IsNumber()
  solidContent1Dry?: number;

  @ApiPropertyOptional({ description: '고형분1 - 고형분%', example: 68.5 })
  @IsOptional()
  @IsNumber()
  solidContent1Percentage?: number;

  @ApiPropertyOptional({ description: '고형분2 - 접시', example: 15.6 })
  @IsOptional()
  @IsNumber()
  solidContent2Dish?: number;

  @ApiPropertyOptional({ description: '고형분2 - 슬러리', example: 20.4 })
  @IsOptional()
  @IsNumber()
  solidContent2Slurry?: number;

  @ApiPropertyOptional({ description: '고형분2 - 건조', example: 18.9 })
  @IsOptional()
  @IsNumber()
  solidContent2Dry?: number;

  @ApiPropertyOptional({ description: '고형분2 - 고형분%', example: 68.8 })
  @IsOptional()
  @IsNumber()
  solidContent2Percentage?: number;

  @ApiPropertyOptional({ description: '고형분3 - 접시', example: 15.5 })
  @IsOptional()
  @IsNumber()
  solidContent3Dish?: number;

  @ApiPropertyOptional({ description: '고형분3 - 슬러리', example: 20.2 })
  @IsOptional()
  @IsNumber()
  solidContent3Slurry?: number;

  @ApiPropertyOptional({ description: '고형분3 - 건조', example: 18.7 })
  @IsOptional()
  @IsNumber()
  solidContent3Dry?: number;

  @ApiPropertyOptional({ description: '고형분3 - 고형분%', example: 68.1 })
  @IsOptional()
  @IsNumber()
  solidContent3Percentage?: number;

  // Grind Gage
  @ApiPropertyOptional({ description: 'Grind Gage - 미세입자 1차', example: 10.0 })
  @IsOptional()
  @IsNumber()
  grindGageFineParticle1?: number;

  @ApiPropertyOptional({ description: 'Grind Gage - 미세입자 2차', example: 9.5 })
  @IsOptional()
  @IsNumber()
  grindGageFineParticle2?: number;

  @ApiPropertyOptional({ description: 'Grind Gage - Line 1차', example: 15.0 })
  @IsOptional()
  @IsNumber()
  grindGageLine1?: number;

  @ApiPropertyOptional({ description: 'Grind Gage - Line 2차', example: 14.8 })
  @IsOptional()
  @IsNumber()
  grindGageLine2?: number;

  @ApiPropertyOptional({ description: 'Grind Gage - 논코팅 1차', example: 20.0 })
  @IsOptional()
  @IsNumber()
  grindGageNonCoating1?: number;

  @ApiPropertyOptional({ description: 'Grind Gage - 논코팅 2차', example: 19.5 })
  @IsOptional()
  @IsNumber()
  grindGageNonCoating2?: number;

  // PD Mixer 1
  @ApiPropertyOptional({ description: 'PD Mixer 1 명칭', example: 'PD Mixer 300L' })
  @IsOptional()
  @IsString()
  pdMixer1Name?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 투입1', example: 15000.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1Input1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 투입률1', example: 100.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1InputRate1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 고형분1', example: 68.5 })
  @IsOptional()
  @IsNumber()
  pdMixer1SolidContent1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 온도1', example: 25.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1Temp1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 저속RPM1', example: 20.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1RpmLow1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 고속RPM1', example: 50.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1RpmHigh1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 시작시간1', example: '09:00:00' })
  @IsOptional()
  @IsString()
  pdMixer1StartTime1?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 종료시간1', example: '09:30:00' })
  @IsOptional()
  @IsString()
  pdMixer1EndTime1?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 투입2', example: 240.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1Input2?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 투입률2', example: 100.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1InputRate2?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 고형분2', example: 68.5 })
  @IsOptional()
  @IsNumber()
  pdMixer1SolidContent2?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 온도2', example: 25.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1Temp2?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 저속RPM2', example: 20.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1RpmLow2?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 고속RPM2', example: 50.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1RpmHigh2?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 시작시간2', example: '09:30:00' })
  @IsOptional()
  @IsString()
  pdMixer1StartTime2?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 종료시간2', example: '10:00:00' })
  @IsOptional()
  @IsString()
  pdMixer1EndTime2?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 투입3', example: 80.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1Input3?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 투입률3', example: 100.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1InputRate3?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 고형분3', example: 68.5 })
  @IsOptional()
  @IsNumber()
  pdMixer1SolidContent3?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 온도3', example: 25.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1Temp3?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 저속RPM3', example: 20.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1RpmLow3?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 고속RPM3', example: 50.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1RpmHigh3?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 시작시간3', example: '10:00:00' })
  @IsOptional()
  @IsString()
  pdMixer1StartTime3?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 종료시간3', example: '10:30:00' })
  @IsOptional()
  @IsString()
  pdMixer1EndTime3?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 투입4', example: 640.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1Input4?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 투입률4', example: 100.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1InputRate4?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 고형분4', example: 68.5 })
  @IsOptional()
  @IsNumber()
  pdMixer1SolidContent4?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 온도4', example: 25.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1Temp4?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 저속RPM4', example: 20.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1RpmLow4?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 고속RPM4', example: 50.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1RpmHigh4?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 시작시간4', example: '10:30:00' })
  @IsOptional()
  @IsString()
  pdMixer1StartTime4?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 종료시간4', example: '11:00:00' })
  @IsOptional()
  @IsString()
  pdMixer1EndTime4?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 투입5', example: 640.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1Input5?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 투입률5', example: 100.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1InputRate5?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 고형분5', example: 68.5 })
  @IsOptional()
  @IsNumber()
  pdMixer1SolidContent5?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 온도5', example: 25.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1Temp5?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 저속RPM5', example: 20.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1RpmLow5?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 고속RPM5', example: 50.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1RpmHigh5?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 시작시간5', example: '11:00:00' })
  @IsOptional()
  @IsString()
  pdMixer1StartTime5?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 종료시간5', example: '11:30:00' })
  @IsOptional()
  @IsString()
  pdMixer1EndTime5?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 투입6', example: 5000.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1Input6?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 투입률6', example: 100.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1InputRate6?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 고형분6', example: 68.5 })
  @IsOptional()
  @IsNumber()
  pdMixer1SolidContent6?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 온도6', example: 25.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1Temp6?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 저속RPM6', example: 20.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1RpmLow6?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 고속RPM6', example: 50.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1RpmHigh6?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 시작시간6', example: '11:30:00' })
  @IsOptional()
  @IsString()
  pdMixer1StartTime6?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 종료시간6', example: '12:00:00' })
  @IsOptional()
  @IsString()
  pdMixer1EndTime6?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 투입7', example: 0.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1Input7?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 투입률7', example: 100.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1InputRate7?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 고형분7', example: 68.5 })
  @IsOptional()
  @IsNumber()
  pdMixer1SolidContent7?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 온도7', example: 25.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1Temp7?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 저속RPM7', example: 20.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1RpmLow7?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 고속RPM7', example: 50.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1RpmHigh7?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 시작시간7', example: '12:00:00' })
  @IsOptional()
  @IsString()
  pdMixer1StartTime7?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 종료시간7', example: '12:30:00' })
  @IsOptional()
  @IsString()
  pdMixer1EndTime7?: string;

  // Viscometer 1
  @ApiPropertyOptional({ description: 'Viscometer 1 - 투입', example: 21000.0 })
  @IsOptional()
  @IsNumber()
  viscometer1Input?: number;

  @ApiPropertyOptional({ description: 'Viscometer 1 - 투입률', example: 100.0 })
  @IsOptional()
  @IsNumber()
  viscometer1InputRate?: number;

  @ApiPropertyOptional({ description: 'Viscometer 1 - 고형분', example: 68.5 })
  @IsOptional()
  @IsNumber()
  viscometer1SolidContent?: number;

  @ApiPropertyOptional({ description: 'Viscometer 1 - 온도', example: 25.0 })
  @IsOptional()
  @IsNumber()
  viscometer1Temp?: number;

  @ApiPropertyOptional({ description: 'Viscometer 1 - 저속RPM', example: 20.0 })
  @IsOptional()
  @IsNumber()
  viscometer1RpmLow?: number;

  @ApiPropertyOptional({ description: 'Viscometer 1 - 고속RPM', example: 50.0 })
  @IsOptional()
  @IsNumber()
  viscometer1RpmHigh?: number;

  @ApiPropertyOptional({ description: 'Viscometer 1 - 시작시간', example: '12:30:00' })
  @IsOptional()
  @IsString()
  viscometer1StartTime?: string;

  @ApiPropertyOptional({ description: 'Viscometer 1 - 종료시간', example: '13:00:00' })
  @IsOptional()
  @IsString()
  viscometer1EndTime?: string;

  // PD Mixer 2
  @ApiPropertyOptional({ description: 'PD Mixer 2 명칭', example: 'PD Mixer 300L' })
  @IsOptional()
  @IsString()
  pdMixer2Name?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 투입1', example: 21000.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2Input1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 투입률1', example: 100.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2InputRate1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 고형분1', example: 68.5 })
  @IsOptional()
  @IsNumber()
  pdMixer2SolidContent1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 온도1', example: 25.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2Temp1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 저속RPM1', example: 20.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2RpmLow1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 고속RPM1', example: 50.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2RpmHigh1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 시작시간1', example: '13:00:00' })
  @IsOptional()
  @IsString()
  pdMixer2StartTime1?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 종료시간1', example: '13:30:00' })
  @IsOptional()
  @IsString()
  pdMixer2EndTime1?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 투입2', example: 21000.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2Input2?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 투입률2', example: 100.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2InputRate2?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 고형분2', example: 68.5 })
  @IsOptional()
  @IsNumber()
  pdMixer2SolidContent2?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 온도2', example: 25.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2Temp2?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 저속RPM2', example: 20.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2RpmLow2?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 고속RPM2', example: 50.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2RpmHigh2?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 시작시간2', example: '13:30:00' })
  @IsOptional()
  @IsString()
  pdMixer2StartTime2?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 종료시간2', example: '14:00:00' })
  @IsOptional()
  @IsString()
  pdMixer2EndTime2?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 투입3', example: 21000.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2Input3?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 투입률3', example: 100.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2InputRate3?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 고형분3', example: 68.5 })
  @IsOptional()
  @IsNumber()
  pdMixer2SolidContent3?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 온도3', example: 25.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2Temp3?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 저속RPM3', example: 20.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2RpmLow3?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 고속RPM3', example: 50.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2RpmHigh3?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 시작시간3', example: '14:00:00' })
  @IsOptional()
  @IsString()
  pdMixer2StartTime3?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 종료시간3', example: '14:30:00' })
  @IsOptional()
  @IsString()
  pdMixer2EndTime3?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 투입4', example: 21000.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2Input4?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 투입률4', example: 100.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2InputRate4?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 고형분4', example: 68.5 })
  @IsOptional()
  @IsNumber()
  pdMixer2SolidContent4?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 온도4', example: 25.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2Temp4?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 저속RPM4', example: 20.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2RpmLow4?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 고속RPM4', example: 50.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2RpmHigh4?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 시작시간4', example: '14:30:00' })
  @IsOptional()
  @IsString()
  pdMixer2StartTime4?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 종료시간4', example: '15:00:00' })
  @IsOptional()
  @IsString()
  pdMixer2EndTime4?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 투입5', example: 21000.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2Input5?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 투입률5', example: 100.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2InputRate5?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 고형분5', example: 68.5 })
  @IsOptional()
  @IsNumber()
  pdMixer2SolidContent5?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 온도5', example: 25.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2Temp5?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 저속RPM5', example: 20.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2RpmLow5?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 고속RPM5', example: 50.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2RpmHigh5?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 시작시간5', example: '15:00:00' })
  @IsOptional()
  @IsString()
  pdMixer2StartTime5?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 종료시간5', example: '15:30:00' })
  @IsOptional()
  @IsString()
  pdMixer2EndTime5?: string;

  // Viscometer 2
  @ApiPropertyOptional({ description: 'Viscometer 2 - 투입', example: 21000.0 })
  @IsOptional()
  @IsNumber()
  viscometer2Input?: number;

  @ApiPropertyOptional({ description: 'Viscometer 2 - 투입률', example: 100.0 })
  @IsOptional()
  @IsNumber()
  viscometer2InputRate?: number;

  @ApiPropertyOptional({ description: 'Viscometer 2 - 고형분', example: 68.5 })
  @IsOptional()
  @IsNumber()
  viscometer2SolidContent?: number;

  @ApiPropertyOptional({ description: 'Viscometer 2 - 온도', example: 25.0 })
  @IsOptional()
  @IsNumber()
  viscometer2Temp?: number;

  @ApiPropertyOptional({ description: 'Viscometer 2 - 저속RPM', example: 20.0 })
  @IsOptional()
  @IsNumber()
  viscometer2RpmLow?: number;

  @ApiPropertyOptional({ description: 'Viscometer 2 - 고속RPM', example: 50.0 })
  @IsOptional()
  @IsNumber()
  viscometer2RpmHigh?: number;

  @ApiPropertyOptional({ description: 'Viscometer 2 - 시작시간', example: '15:30:00' })
  @IsOptional()
  @IsString()
  viscometer2StartTime?: string;

  @ApiPropertyOptional({ description: 'Viscometer 2 - 종료시간', example: '16:00:00' })
  @IsOptional()
  @IsString()
  viscometer2EndTime?: string;

  // PD Mixer 3
  @ApiPropertyOptional({ description: 'PD Mixer 3 명칭', example: 'PD Mixer 300L' })
  @IsOptional()
  @IsString()
  pdMixer3Name?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 3 - 투입1', example: 21000.0 })
  @IsOptional()
  @IsNumber()
  pdMixer3Input1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 3 - 투입률1', example: 100.0 })
  @IsOptional()
  @IsNumber()
  pdMixer3InputRate1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 3 - 고형분1', example: 68.5 })
  @IsOptional()
  @IsNumber()
  pdMixer3SolidContent1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 3 - 온도1', example: 25.0 })
  @IsOptional()
  @IsNumber()
  pdMixer3Temp1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 3 - 저속RPM1', example: 20.0 })
  @IsOptional()
  @IsNumber()
  pdMixer3RpmLow1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 3 - 고속RPM1', example: 50.0 })
  @IsOptional()
  @IsNumber()
  pdMixer3RpmHigh1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 3 - 시작시간1', example: '16:00:00' })
  @IsOptional()
  @IsString()
  pdMixer3StartTime1?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 3 - 종료시간1', example: '16:30:00' })
  @IsOptional()
  @IsString()
  pdMixer3EndTime1?: string;

  // Viscometer 3
  @ApiPropertyOptional({ description: 'Viscometer 3 - 투입', example: 21000.0 })
  @IsOptional()
  @IsNumber()
  viscometer3Input?: number;

  @ApiPropertyOptional({ description: 'Viscometer 3 - 투입률', example: 100.0 })
  @IsOptional()
  @IsNumber()
  viscometer3InputRate?: number;

  @ApiPropertyOptional({ description: 'Viscometer 3 - 고형분', example: 68.5 })
  @IsOptional()
  @IsNumber()
  viscometer3SolidContent?: number;

  @ApiPropertyOptional({ description: 'Viscometer 3 - 온도', example: 25.0 })
  @IsOptional()
  @IsNumber()
  viscometer3Temp?: number;

  @ApiPropertyOptional({ description: 'Viscometer 3 - 저속RPM', example: 20.0 })
  @IsOptional()
  @IsNumber()
  viscometer3RpmLow?: number;

  @ApiPropertyOptional({ description: 'Viscometer 3 - 고속RPM', example: 50.0 })
  @IsOptional()
  @IsNumber()
  viscometer3RpmHigh?: number;

  @ApiPropertyOptional({ description: 'Viscometer 3 - 시작시간', example: '16:30:00' })
  @IsOptional()
  @IsString()
  viscometer3StartTime?: string;

  @ApiPropertyOptional({ description: 'Viscometer 3 - 종료시간', example: '17:00:00' })
  @IsOptional()
  @IsString()
  viscometer3EndTime?: string;

  // PD Mixer 4
  @ApiPropertyOptional({ description: 'PD Mixer 4 명칭', example: 'PD Mixer 300L' })
  @IsOptional()
  @IsString()
  pdMixer4Name?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 4 - 투입1', example: 21000.0 })
  @IsOptional()
  @IsNumber()
  pdMixer4Input1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 4 - 투입률1', example: 100.0 })
  @IsOptional()
  @IsNumber()
  pdMixer4InputRate1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 4 - 고형분1', example: 68.5 })
  @IsOptional()
  @IsNumber()
  pdMixer4SolidContent1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 4 - 온도1', example: 25.0 })
  @IsOptional()
  @IsNumber()
  pdMixer4Temp1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 4 - 저속RPM1', example: 20.0 })
  @IsOptional()
  @IsNumber()
  pdMixer4RpmLow1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 4 - 고속RPM1', example: 50.0 })
  @IsOptional()
  @IsNumber()
  pdMixer4RpmHigh1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 4 - 시작시간1', example: '17:00:00' })
  @IsOptional()
  @IsString()
  pdMixer4StartTime1?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 4 - 종료시간1', example: '17:30:00' })
  @IsOptional()
  @IsString()
  pdMixer4EndTime1?: string;
}

export class UpdateSlurryWorklogDto {
  @ApiPropertyOptional({ description: '제조 일자', example: '2025-12-01' })
  @IsOptional()
  @IsDateString()
  manufactureDate?: string;

  @ApiPropertyOptional({ description: '작업자', example: '박호언' })
  @IsOptional()
  @IsString()
  worker?: string;

  @ApiPropertyOptional({ description: '라인명', example: '슬러리 라인' })
  @IsOptional()
  @IsString()
  line?: string;

  @ApiPropertyOptional({ description: '설비명', example: 'PD Mixer 300L' })
  @IsOptional()
  @IsString()
  plant?: string;

  @ApiPropertyOptional({ description: 'shift', example: '1 shift' })
  @IsOptional()
  @IsString()
  shift?: string;

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

  // 원료 1-8 (모두 optional이므로 CreateSlurryWorklogDto와 동일한 필드들을 그대로 복사)
  @ApiPropertyOptional({ description: '원료1 명칭', example: 'NCM' })
  @IsOptional()
  @IsString()
  material1Name?: string;

  @ApiPropertyOptional({ description: '원료1 조성', example: 94.0 })
  @IsOptional()
  @IsNumber()
  material1Composition?: number;

  @ApiPropertyOptional({ description: '원료1 LOT', example: 'NCM-2024-001' })
  @IsOptional()
  @IsString()
  material1Lot?: string;

  @ApiPropertyOptional({ description: '원료1 투입계획', example: 15000.0 })
  @IsOptional()
  @IsNumber()
  material1PlannedInput?: number;

  @ApiPropertyOptional({ description: '원료1 투입실적', example: 14998.5 })
  @IsOptional()
  @IsNumber()
  material1ActualInput?: number;

  @ApiPropertyOptional({ description: '원료2 명칭', example: 'Super-P' })
  @IsOptional()
  @IsString()
  material2Name?: string;

  @ApiPropertyOptional({ description: '원료2 조성', example: 1.5 })
  @IsOptional()
  @IsNumber()
  material2Composition?: number;

  @ApiPropertyOptional({ description: '원료2 LOT', example: 'SP-2024-001' })
  @IsOptional()
  @IsString()
  material2Lot?: string;

  @ApiPropertyOptional({ description: '원료2 투입계획', example: 240.0 })
  @IsOptional()
  @IsNumber()
  material2PlannedInput?: number;

  @ApiPropertyOptional({ description: '원료2 투입실적', example: 239.8 })
  @IsOptional()
  @IsNumber()
  material2ActualInput?: number;

  @ApiPropertyOptional({ description: '원료3 명칭', example: 'CNT' })
  @IsOptional()
  @IsString()
  material3Name?: string;

  @ApiPropertyOptional({ description: '원료3 조성', example: 0.5 })
  @IsOptional()
  @IsNumber()
  material3Composition?: number;

  @ApiPropertyOptional({ description: '원료3 LOT', example: 'CNT-2024-001' })
  @IsOptional()
  @IsString()
  material3Lot?: string;

  @ApiPropertyOptional({ description: '원료3 투입계획', example: 80.0 })
  @IsOptional()
  @IsNumber()
  material3PlannedInput?: number;

  @ApiPropertyOptional({ description: '원료3 투입실적', example: 79.9 })
  @IsOptional()
  @IsNumber()
  material3ActualInput?: number;

  @ApiPropertyOptional({ description: '원료4 명칭', example: 'PVDF' })
  @IsOptional()
  @IsString()
  material4Name?: string;

  @ApiPropertyOptional({ description: '원료4 조성', example: 4.0 })
  @IsOptional()
  @IsNumber()
  material4Composition?: number;

  @ApiPropertyOptional({ description: '원료4 LOT', example: 'PVDF-2024-001' })
  @IsOptional()
  @IsString()
  material4Lot?: string;

  @ApiPropertyOptional({ description: '원료4 투입계획', example: 640.0 })
  @IsOptional()
  @IsNumber()
  material4PlannedInput?: number;

  @ApiPropertyOptional({ description: '원료4 투입실적', example: 639.5 })
  @IsOptional()
  @IsNumber()
  material4ActualInput?: number;

  @ApiPropertyOptional({ description: '원료5 명칭', example: 'NMP' })
  @IsOptional()
  @IsString()
  material5Name?: string;

  @ApiPropertyOptional({ description: '원료5 조성', example: 0.0 })
  @IsOptional()
  @IsNumber()
  material5Composition?: number;

  @ApiPropertyOptional({ description: '원료5 LOT', example: 'NMP-2024-001' })
  @IsOptional()
  @IsString()
  material5Lot?: string;

  @ApiPropertyOptional({ description: '원료5 투입계획', example: 5000.0 })
  @IsOptional()
  @IsNumber()
  material5PlannedInput?: number;

  @ApiPropertyOptional({ description: '원료5 투입실적', example: 4998.0 })
  @IsOptional()
  @IsNumber()
  material5ActualInput?: number;

  @ApiPropertyOptional({ description: '원료6 명칭', example: '' })
  @IsOptional()
  @IsString()
  material6Name?: string;

  @ApiPropertyOptional({ description: '원료6 조성', example: 0.0 })
  @IsOptional()
  @IsNumber()
  material6Composition?: number;

  @ApiPropertyOptional({ description: '원료6 LOT', example: '' })
  @IsOptional()
  @IsString()
  material6Lot?: string;

  @ApiPropertyOptional({ description: '원료6 투입계획', example: 0.0 })
  @IsOptional()
  @IsNumber()
  material6PlannedInput?: number;

  @ApiPropertyOptional({ description: '원료6 투입실적', example: 0.0 })
  @IsOptional()
  @IsNumber()
  material6ActualInput?: number;

  @ApiPropertyOptional({ description: '원료7 명칭', example: '' })
  @IsOptional()
  @IsString()
  material7Name?: string;

  @ApiPropertyOptional({ description: '원료7 조성', example: 0.0 })
  @IsOptional()
  @IsNumber()
  material7Composition?: number;

  @ApiPropertyOptional({ description: '원료7 LOT', example: '' })
  @IsOptional()
  @IsString()
  material7Lot?: string;

  @ApiPropertyOptional({ description: '원료7 투입계획', example: 0.0 })
  @IsOptional()
  @IsNumber()
  material7PlannedInput?: number;

  @ApiPropertyOptional({ description: '원료7 투입실적', example: 0.0 })
  @IsOptional()
  @IsNumber()
  material7ActualInput?: number;

  @ApiPropertyOptional({ description: '원료8 명칭', example: '' })
  @IsOptional()
  @IsString()
  material8Name?: string;

  @ApiPropertyOptional({ description: '원료8 조성', example: 0.0 })
  @IsOptional()
  @IsNumber()
  material8Composition?: number;

  @ApiPropertyOptional({ description: '원료8 LOT', example: '' })
  @IsOptional()
  @IsString()
  material8Lot?: string;

  @ApiPropertyOptional({ description: '원료8 투입계획', example: 0.0 })
  @IsOptional()
  @IsNumber()
  material8PlannedInput?: number;

  @ApiPropertyOptional({ description: '원료8 투입실적', example: 0.0 })
  @IsOptional()
  @IsNumber()
  material8ActualInput?: number;

  @ApiPropertyOptional({ description: 'Solid Content', example: 68.5 })
  @IsOptional()
  @IsNumber()
  solidContent?: number;

  @ApiPropertyOptional({ description: '슬러리 LOT', example: 'SLURRY-2024-001' })
  @IsOptional()
  @IsString()
  lot?: string;

  @ApiPropertyOptional({ description: '점도 측정 - 믹싱 후', example: 3500.0 })
  @IsOptional()
  @IsNumber()
  viscosityAfterMixing?: number;

  @ApiPropertyOptional({ description: '점도 측정 - 탈포 후', example: 3450.0 })
  @IsOptional()
  @IsNumber()
  viscosityAfterDefoaming?: number;

  @ApiPropertyOptional({ description: '점도 측정 - 안정화 후', example: 3400.0 })
  @IsOptional()
  @IsNumber()
  viscosityAfterStabilization?: number;

  @ApiPropertyOptional({ description: '점도 측정 4번째 라벨', example: '검사 후' })
  @IsOptional()
  @IsString()
  viscosity4Label?: string;

  @ApiPropertyOptional({ description: '점도 측정 4번째 값', example: 3380.0 })
  @IsOptional()
  @IsNumber()
  viscosity4Value?: number;

  @ApiPropertyOptional({ description: '고형분1 - 접시', example: 15.5 })
  @IsOptional()
  @IsNumber()
  solidContent1Dish?: number;

  @ApiPropertyOptional({ description: '고형분1 - 슬러리', example: 20.3 })
  @IsOptional()
  @IsNumber()
  solidContent1Slurry?: number;

  @ApiPropertyOptional({ description: '고형분1 - 건조', example: 18.8 })
  @IsOptional()
  @IsNumber()
  solidContent1Dry?: number;

  @ApiPropertyOptional({ description: '고형분1 - 고형분%', example: 68.5 })
  @IsOptional()
  @IsNumber()
  solidContent1Percentage?: number;

  @ApiPropertyOptional({ description: '고형분2 - 접시', example: 15.6 })
  @IsOptional()
  @IsNumber()
  solidContent2Dish?: number;

  @ApiPropertyOptional({ description: '고형분2 - 슬러리', example: 20.4 })
  @IsOptional()
  @IsNumber()
  solidContent2Slurry?: number;

  @ApiPropertyOptional({ description: '고형분2 - 건조', example: 18.9 })
  @IsOptional()
  @IsNumber()
  solidContent2Dry?: number;

  @ApiPropertyOptional({ description: '고형분2 - 고형분%', example: 68.8 })
  @IsOptional()
  @IsNumber()
  solidContent2Percentage?: number;

  @ApiPropertyOptional({ description: '고형분3 - 접시', example: 15.5 })
  @IsOptional()
  @IsNumber()
  solidContent3Dish?: number;

  @ApiPropertyOptional({ description: '고형분3 - 슬러리', example: 20.2 })
  @IsOptional()
  @IsNumber()
  solidContent3Slurry?: number;

  @ApiPropertyOptional({ description: '고형분3 - 건조', example: 18.7 })
  @IsOptional()
  @IsNumber()
  solidContent3Dry?: number;

  @ApiPropertyOptional({ description: '고형분3 - 고형분%', example: 68.1 })
  @IsOptional()
  @IsNumber()
  solidContent3Percentage?: number;

  @ApiPropertyOptional({ description: 'Grind Gage - 미세입자 1차', example: 10.0 })
  @IsOptional()
  @IsNumber()
  grindGageFineParticle1?: number;

  @ApiPropertyOptional({ description: 'Grind Gage - 미세입자 2차', example: 9.5 })
  @IsOptional()
  @IsNumber()
  grindGageFineParticle2?: number;

  @ApiPropertyOptional({ description: 'Grind Gage - Line 1차', example: 15.0 })
  @IsOptional()
  @IsNumber()
  grindGageLine1?: number;

  @ApiPropertyOptional({ description: 'Grind Gage - Line 2차', example: 14.8 })
  @IsOptional()
  @IsNumber()
  grindGageLine2?: number;

  @ApiPropertyOptional({ description: 'Grind Gage - 논코팅 1차', example: 20.0 })
  @IsOptional()
  @IsNumber()
  grindGageNonCoating1?: number;

  @ApiPropertyOptional({ description: 'Grind Gage - 논코팅 2차', example: 19.5 })
  @IsOptional()
  @IsNumber()
  grindGageNonCoating2?: number;

  // PD Mixer 1
  @ApiPropertyOptional({ description: 'PD Mixer 1 명칭', example: 'PD Mixer 300L' })
  @IsOptional()
  @IsString()
  pdMixer1Name?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 투입1', example: 15000.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1Input1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 투입률1', example: 100.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1InputRate1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 고형분1', example: 68.5 })
  @IsOptional()
  @IsNumber()
  pdMixer1SolidContent1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 온도1', example: 25.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1Temp1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 저속RPM1', example: 20.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1RpmLow1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 고속RPM1', example: 50.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1RpmHigh1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 시작시간1', example: '09:00:00' })
  @IsOptional()
  @IsString()
  pdMixer1StartTime1?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 종료시간1', example: '09:30:00' })
  @IsOptional()
  @IsString()
  pdMixer1EndTime1?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 투입2', example: 240.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1Input2?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 투입률2', example: 100.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1InputRate2?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 고형분2', example: 68.5 })
  @IsOptional()
  @IsNumber()
  pdMixer1SolidContent2?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 온도2', example: 25.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1Temp2?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 저속RPM2', example: 20.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1RpmLow2?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 고속RPM2', example: 50.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1RpmHigh2?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 시작시간2', example: '09:30:00' })
  @IsOptional()
  @IsString()
  pdMixer1StartTime2?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 종료시간2', example: '10:00:00' })
  @IsOptional()
  @IsString()
  pdMixer1EndTime2?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 투입3', example: 80.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1Input3?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 투입률3', example: 100.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1InputRate3?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 고형분3', example: 68.5 })
  @IsOptional()
  @IsNumber()
  pdMixer1SolidContent3?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 온도3', example: 25.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1Temp3?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 저속RPM3', example: 20.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1RpmLow3?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 고속RPM3', example: 50.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1RpmHigh3?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 시작시간3', example: '10:00:00' })
  @IsOptional()
  @IsString()
  pdMixer1StartTime3?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 종료시간3', example: '10:30:00' })
  @IsOptional()
  @IsString()
  pdMixer1EndTime3?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 투입4', example: 640.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1Input4?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 투입률4', example: 100.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1InputRate4?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 고형분4', example: 68.5 })
  @IsOptional()
  @IsNumber()
  pdMixer1SolidContent4?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 온도4', example: 25.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1Temp4?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 저속RPM4', example: 20.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1RpmLow4?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 고속RPM4', example: 50.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1RpmHigh4?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 시작시간4', example: '10:30:00' })
  @IsOptional()
  @IsString()
  pdMixer1StartTime4?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 종료시간4', example: '11:00:00' })
  @IsOptional()
  @IsString()
  pdMixer1EndTime4?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 투입5', example: 640.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1Input5?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 투입률5', example: 100.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1InputRate5?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 고형분5', example: 68.5 })
  @IsOptional()
  @IsNumber()
  pdMixer1SolidContent5?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 온도5', example: 25.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1Temp5?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 저속RPM5', example: 20.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1RpmLow5?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 고속RPM5', example: 50.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1RpmHigh5?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 시작시간5', example: '11:00:00' })
  @IsOptional()
  @IsString()
  pdMixer1StartTime5?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 종료시간5', example: '11:30:00' })
  @IsOptional()
  @IsString()
  pdMixer1EndTime5?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 투입6', example: 5000.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1Input6?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 투입률6', example: 100.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1InputRate6?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 고형분6', example: 68.5 })
  @IsOptional()
  @IsNumber()
  pdMixer1SolidContent6?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 온도6', example: 25.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1Temp6?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 저속RPM6', example: 20.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1RpmLow6?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 고속RPM6', example: 50.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1RpmHigh6?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 시작시간6', example: '11:30:00' })
  @IsOptional()
  @IsString()
  pdMixer1StartTime6?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 종료시간6', example: '12:00:00' })
  @IsOptional()
  @IsString()
  pdMixer1EndTime6?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 투입7', example: 0.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1Input7?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 투입률7', example: 100.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1InputRate7?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 고형분7', example: 68.5 })
  @IsOptional()
  @IsNumber()
  pdMixer1SolidContent7?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 온도7', example: 25.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1Temp7?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 저속RPM7', example: 20.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1RpmLow7?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 고속RPM7', example: 50.0 })
  @IsOptional()
  @IsNumber()
  pdMixer1RpmHigh7?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 시작시간7', example: '12:00:00' })
  @IsOptional()
  @IsString()
  pdMixer1StartTime7?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 1 - 종료시간7', example: '12:30:00' })
  @IsOptional()
  @IsString()
  pdMixer1EndTime7?: string;

  // Viscometer 1
  @ApiPropertyOptional({ description: 'Viscometer 1 - 투입', example: 21000.0 })
  @IsOptional()
  @IsNumber()
  viscometer1Input?: number;

  @ApiPropertyOptional({ description: 'Viscometer 1 - 투입률', example: 100.0 })
  @IsOptional()
  @IsNumber()
  viscometer1InputRate?: number;

  @ApiPropertyOptional({ description: 'Viscometer 1 - 고형분', example: 68.5 })
  @IsOptional()
  @IsNumber()
  viscometer1SolidContent?: number;

  @ApiPropertyOptional({ description: 'Viscometer 1 - 온도', example: 25.0 })
  @IsOptional()
  @IsNumber()
  viscometer1Temp?: number;

  @ApiPropertyOptional({ description: 'Viscometer 1 - 저속RPM', example: 20.0 })
  @IsOptional()
  @IsNumber()
  viscometer1RpmLow?: number;

  @ApiPropertyOptional({ description: 'Viscometer 1 - 고속RPM', example: 50.0 })
  @IsOptional()
  @IsNumber()
  viscometer1RpmHigh?: number;

  @ApiPropertyOptional({ description: 'Viscometer 1 - 시작시간', example: '12:30:00' })
  @IsOptional()
  @IsString()
  viscometer1StartTime?: string;

  @ApiPropertyOptional({ description: 'Viscometer 1 - 종료시간', example: '13:00:00' })
  @IsOptional()
  @IsString()
  viscometer1EndTime?: string;

  // PD Mixer 2
  @ApiPropertyOptional({ description: 'PD Mixer 2 명칭', example: 'PD Mixer 300L' })
  @IsOptional()
  @IsString()
  pdMixer2Name?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 투입1', example: 21000.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2Input1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 투입률1', example: 100.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2InputRate1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 고형분1', example: 68.5 })
  @IsOptional()
  @IsNumber()
  pdMixer2SolidContent1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 온도1', example: 25.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2Temp1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 저속RPM1', example: 20.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2RpmLow1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 고속RPM1', example: 50.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2RpmHigh1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 시작시간1', example: '13:00:00' })
  @IsOptional()
  @IsString()
  pdMixer2StartTime1?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 종료시간1', example: '13:30:00' })
  @IsOptional()
  @IsString()
  pdMixer2EndTime1?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 투입2', example: 21000.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2Input2?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 투입률2', example: 100.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2InputRate2?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 고형분2', example: 68.5 })
  @IsOptional()
  @IsNumber()
  pdMixer2SolidContent2?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 온도2', example: 25.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2Temp2?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 저속RPM2', example: 20.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2RpmLow2?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 고속RPM2', example: 50.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2RpmHigh2?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 시작시간2', example: '13:30:00' })
  @IsOptional()
  @IsString()
  pdMixer2StartTime2?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 종료시간2', example: '14:00:00' })
  @IsOptional()
  @IsString()
  pdMixer2EndTime2?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 투입3', example: 21000.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2Input3?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 투입률3', example: 100.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2InputRate3?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 고형분3', example: 68.5 })
  @IsOptional()
  @IsNumber()
  pdMixer2SolidContent3?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 온도3', example: 25.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2Temp3?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 저속RPM3', example: 20.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2RpmLow3?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 고속RPM3', example: 50.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2RpmHigh3?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 시작시간3', example: '14:00:00' })
  @IsOptional()
  @IsString()
  pdMixer2StartTime3?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 종료시간3', example: '14:30:00' })
  @IsOptional()
  @IsString()
  pdMixer2EndTime3?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 투입4', example: 21000.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2Input4?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 투입률4', example: 100.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2InputRate4?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 고형분4', example: 68.5 })
  @IsOptional()
  @IsNumber()
  pdMixer2SolidContent4?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 온도4', example: 25.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2Temp4?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 저속RPM4', example: 20.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2RpmLow4?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 고속RPM4', example: 50.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2RpmHigh4?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 시작시간4', example: '14:30:00' })
  @IsOptional()
  @IsString()
  pdMixer2StartTime4?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 종료시간4', example: '15:00:00' })
  @IsOptional()
  @IsString()
  pdMixer2EndTime4?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 투입5', example: 21000.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2Input5?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 투입률5', example: 100.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2InputRate5?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 고형분5', example: 68.5 })
  @IsOptional()
  @IsNumber()
  pdMixer2SolidContent5?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 온도5', example: 25.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2Temp5?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 저속RPM5', example: 20.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2RpmLow5?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 고속RPM5', example: 50.0 })
  @IsOptional()
  @IsNumber()
  pdMixer2RpmHigh5?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 시작시간5', example: '15:00:00' })
  @IsOptional()
  @IsString()
  pdMixer2StartTime5?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 2 - 종료시간5', example: '15:30:00' })
  @IsOptional()
  @IsString()
  pdMixer2EndTime5?: string;

  // Viscometer 2
  @ApiPropertyOptional({ description: 'Viscometer 2 - 투입', example: 21000.0 })
  @IsOptional()
  @IsNumber()
  viscometer2Input?: number;

  @ApiPropertyOptional({ description: 'Viscometer 2 - 투입률', example: 100.0 })
  @IsOptional()
  @IsNumber()
  viscometer2InputRate?: number;

  @ApiPropertyOptional({ description: 'Viscometer 2 - 고형분', example: 68.5 })
  @IsOptional()
  @IsNumber()
  viscometer2SolidContent?: number;

  @ApiPropertyOptional({ description: 'Viscometer 2 - 온도', example: 25.0 })
  @IsOptional()
  @IsNumber()
  viscometer2Temp?: number;

  @ApiPropertyOptional({ description: 'Viscometer 2 - 저속RPM', example: 20.0 })
  @IsOptional()
  @IsNumber()
  viscometer2RpmLow?: number;

  @ApiPropertyOptional({ description: 'Viscometer 2 - 고속RPM', example: 50.0 })
  @IsOptional()
  @IsNumber()
  viscometer2RpmHigh?: number;

  @ApiPropertyOptional({ description: 'Viscometer 2 - 시작시간', example: '15:30:00' })
  @IsOptional()
  @IsString()
  viscometer2StartTime?: string;

  @ApiPropertyOptional({ description: 'Viscometer 2 - 종료시간', example: '16:00:00' })
  @IsOptional()
  @IsString()
  viscometer2EndTime?: string;

  // PD Mixer 3
  @ApiPropertyOptional({ description: 'PD Mixer 3 명칭', example: 'PD Mixer 300L' })
  @IsOptional()
  @IsString()
  pdMixer3Name?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 3 - 투입1', example: 21000.0 })
  @IsOptional()
  @IsNumber()
  pdMixer3Input1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 3 - 투입률1', example: 100.0 })
  @IsOptional()
  @IsNumber()
  pdMixer3InputRate1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 3 - 고형분1', example: 68.5 })
  @IsOptional()
  @IsNumber()
  pdMixer3SolidContent1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 3 - 온도1', example: 25.0 })
  @IsOptional()
  @IsNumber()
  pdMixer3Temp1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 3 - 저속RPM1', example: 20.0 })
  @IsOptional()
  @IsNumber()
  pdMixer3RpmLow1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 3 - 고속RPM1', example: 50.0 })
  @IsOptional()
  @IsNumber()
  pdMixer3RpmHigh1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 3 - 시작시간1', example: '16:00:00' })
  @IsOptional()
  @IsString()
  pdMixer3StartTime1?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 3 - 종료시간1', example: '16:30:00' })
  @IsOptional()
  @IsString()
  pdMixer3EndTime1?: string;

  // Viscometer 3
  @ApiPropertyOptional({ description: 'Viscometer 3 - 투입', example: 21000.0 })
  @IsOptional()
  @IsNumber()
  viscometer3Input?: number;

  @ApiPropertyOptional({ description: 'Viscometer 3 - 투입률', example: 100.0 })
  @IsOptional()
  @IsNumber()
  viscometer3InputRate?: number;

  @ApiPropertyOptional({ description: 'Viscometer 3 - 고형분', example: 68.5 })
  @IsOptional()
  @IsNumber()
  viscometer3SolidContent?: number;

  @ApiPropertyOptional({ description: 'Viscometer 3 - 온도', example: 25.0 })
  @IsOptional()
  @IsNumber()
  viscometer3Temp?: number;

  @ApiPropertyOptional({ description: 'Viscometer 3 - 저속RPM', example: 20.0 })
  @IsOptional()
  @IsNumber()
  viscometer3RpmLow?: number;

  @ApiPropertyOptional({ description: 'Viscometer 3 - 고속RPM', example: 50.0 })
  @IsOptional()
  @IsNumber()
  viscometer3RpmHigh?: number;

  @ApiPropertyOptional({ description: 'Viscometer 3 - 시작시간', example: '16:30:00' })
  @IsOptional()
  @IsString()
  viscometer3StartTime?: string;

  @ApiPropertyOptional({ description: 'Viscometer 3 - 종료시간', example: '17:00:00' })
  @IsOptional()
  @IsString()
  viscometer3EndTime?: string;

  // PD Mixer 4
  @ApiPropertyOptional({ description: 'PD Mixer 4 명칭', example: 'PD Mixer 300L' })
  @IsOptional()
  @IsString()
  pdMixer4Name?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 4 - 투입1', example: 21000.0 })
  @IsOptional()
  @IsNumber()
  pdMixer4Input1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 4 - 투입률1', example: 100.0 })
  @IsOptional()
  @IsNumber()
  pdMixer4InputRate1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 4 - 고형분1', example: 68.5 })
  @IsOptional()
  @IsNumber()
  pdMixer4SolidContent1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 4 - 온도1', example: 25.0 })
  @IsOptional()
  @IsNumber()
  pdMixer4Temp1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 4 - 저속RPM1', example: 20.0 })
  @IsOptional()
  @IsNumber()
  pdMixer4RpmLow1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 4 - 고속RPM1', example: 50.0 })
  @IsOptional()
  @IsNumber()
  pdMixer4RpmHigh1?: number;

  @ApiPropertyOptional({ description: 'PD Mixer 4 - 시작시간1', example: '17:00:00' })
  @IsOptional()
  @IsString()
  pdMixer4StartTime1?: string;

  @ApiPropertyOptional({ description: 'PD Mixer 4 - 종료시간1', example: '17:30:00' })
  @IsOptional()
  @IsString()
  pdMixer4EndTime1?: string;
}

export class SlurryWorklogListResponseDto {
  @ApiProperty({ description: 'ID', example: 1 })
  id: number;

  @ApiProperty({ description: '작업일 (제조일자)', example: '2025-12-01' })
  workDate: string;

  @ApiProperty({ description: '회차', example: 1 })
  round: number;

  @ApiProperty({ description: '작성자', example: '박호언' })
  writer: string;
}
