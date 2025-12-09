import { Entity, Column } from 'typeorm';
import { WorklogBase } from './worklog-base.entity';

@Entity('worklog_slurries')
export class WorklogSlurry extends WorklogBase {
  // 자재 투입 정보 - 원료1
  @Column({ type: 'varchar', length: 50, nullable: true })
  material1Name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  material1Composition: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  material1Lot: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  material1PlannedInput: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  material1ActualInput: number;

  // 자재 투입 정보 - 원료2
  @Column({ type: 'varchar', length: 50, nullable: true })
  material2Name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  material2Composition: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  material2Lot: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  material2PlannedInput: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  material2ActualInput: number;

  // 자재 투입 정보 - 원료3
  @Column({ type: 'varchar', length: 50, nullable: true })
  material3Name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  material3Composition: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  material3Lot: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  material3PlannedInput: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  material3ActualInput: number;

  // 자재 투입 정보 - 원료4
  @Column({ type: 'varchar', length: 50, nullable: true })
  material4Name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  material4Composition: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  material4Lot: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  material4PlannedInput: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  material4ActualInput: number;

  // 자재 투입 정보 - 원료5
  @Column({ type: 'varchar', length: 50, nullable: true })
  material5Name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  material5Composition: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  material5Lot: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  material5PlannedInput: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  material5ActualInput: number;

  // 자재 투입 정보 - 원료6
  @Column({ type: 'varchar', length: 50, nullable: true })
  material6Name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  material6Composition: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  material6Lot: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  material6PlannedInput: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  material6ActualInput: number;

  // 자재 투입 정보 - 원료7
  @Column({ type: 'varchar', length: 50, nullable: true })
  material7Name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  material7Composition: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  material7Lot: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  material7PlannedInput: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  material7ActualInput: number;

  // 자재 투입 정보 - 원료8
  @Column({ type: 'varchar', length: 50, nullable: true })
  material8Name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  material8Composition: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  material8Lot: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  material8PlannedInput: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  material8ActualInput: number;

  // Solide Content
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  solidContent: number;

  // 생산 정보 - 슬러리 Lot
  @Column({ type: 'varchar', length: 100, nullable: true })
  lot: string;

  // 생산 정보 - 점도 (믹싱 후, 탈포 후, 안정화 후, 4번째)
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  viscosityAfterMixing: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  viscosityAfterDefoaming: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  viscosityAfterStabilization: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  viscosity4Label: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  viscosity4Value: number;

  // 생산 정보 - 고형분 (접시, 슬러리, 건조, 고형분%)
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  solidContent1Dish: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  solidContent1Slurry: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  solidContent1Dry: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  solidContent1Percentage: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  solidContent2Dish: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  solidContent2Slurry: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  solidContent2Dry: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  solidContent2Percentage: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  solidContent3Dish: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  solidContent3Slurry: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  solidContent3Dry: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  solidContent3Percentage: number;

  // 생산 정보 - Grind Gage - 미세입자 (1차, 2차)
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  grindGageFineParticle1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  grindGageFineParticle2: number;

  // 생산 정보 - Grind Gage - Line (1차, 2차)
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  grindGageLine1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  grindGageLine2: number;

  // 생산 정보 - Grind Gage - 논코팅 (1차, 2차)
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  grindGageNonCoating1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  grindGageNonCoating2: number;

  // 공정 조건 - PD Mixer 1
  @Column({ type: 'varchar', length: 100, nullable: true })
  pdMixer1Name: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  pdMixer1Input1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer1InputRate1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer1SolidContent1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer1Temp1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer1RpmLow1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer1RpmHigh1: number;

  @Column({ type: 'time', nullable: true })
  pdMixer1StartTime1: string;

  @Column({ type: 'time', nullable: true })
  pdMixer1EndTime1: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  pdMixer1Input2: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer1InputRate2: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer1SolidContent2: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer1Temp2: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer1RpmLow2: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer1RpmHigh2: number;

  @Column({ type: 'time', nullable: true })
  pdMixer1StartTime2: string;

  @Column({ type: 'time', nullable: true })
  pdMixer1EndTime2: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  pdMixer1Input3: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer1InputRate3: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer1SolidContent3: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer1Temp3: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer1RpmLow3: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer1RpmHigh3: number;

  @Column({ type: 'time', nullable: true })
  pdMixer1StartTime3: string;

  @Column({ type: 'time', nullable: true })
  pdMixer1EndTime3: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  pdMixer1Input4: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer1InputRate4: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer1SolidContent4: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer1Temp4: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer1RpmLow4: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer1RpmHigh4: number;

  @Column({ type: 'time', nullable: true })
  pdMixer1StartTime4: string;

  @Column({ type: 'time', nullable: true })
  pdMixer1EndTime4: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  pdMixer1Input5: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer1InputRate5: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer1SolidContent5: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer1Temp5: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer1RpmLow5: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer1RpmHigh5: number;

  @Column({ type: 'time', nullable: true })
  pdMixer1StartTime5: string;

  @Column({ type: 'time', nullable: true })
  pdMixer1EndTime5: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  pdMixer1Input6: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer1InputRate6: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer1SolidContent6: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer1Temp6: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer1RpmLow6: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer1RpmHigh6: number;

  @Column({ type: 'time', nullable: true })
  pdMixer1StartTime6: string;

  @Column({ type: 'time', nullable: true })
  pdMixer1EndTime6: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  pdMixer1Input7: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer1InputRate7: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer1SolidContent7: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer1Temp7: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer1RpmLow7: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer1RpmHigh7: number;

  @Column({ type: 'time', nullable: true })
  pdMixer1StartTime7: string;

  @Column({ type: 'time', nullable: true })
  pdMixer1EndTime7: string;

  // Viscometer 1
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  viscometer1Input: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  viscometer1InputRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  viscometer1SolidContent: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  viscometer1Temp: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  viscometer1RpmLow: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  viscometer1RpmHigh: number;

  @Column({ type: 'time', nullable: true })
  viscometer1StartTime: string;

  @Column({ type: 'time', nullable: true })
  viscometer1EndTime: string;

  // PD Mixer 2
  @Column({ type: 'varchar', length: 100, nullable: true })
  pdMixer2Name: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  pdMixer2Input1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer2InputRate1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer2SolidContent1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer2Temp1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer2RpmLow1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer2RpmHigh1: number;

  @Column({ type: 'time', nullable: true })
  pdMixer2StartTime1: string;

  @Column({ type: 'time', nullable: true })
  pdMixer2EndTime1: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  pdMixer2Input2: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer2InputRate2: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer2SolidContent2: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer2Temp2: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer2RpmLow2: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer2RpmHigh2: number;

  @Column({ type: 'time', nullable: true })
  pdMixer2StartTime2: string;

  @Column({ type: 'time', nullable: true })
  pdMixer2EndTime2: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  pdMixer2Input3: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer2InputRate3: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer2SolidContent3: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer2Temp3: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer2RpmLow3: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer2RpmHigh3: number;

  @Column({ type: 'time', nullable: true })
  pdMixer2StartTime3: string;

  @Column({ type: 'time', nullable: true })
  pdMixer2EndTime3: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  pdMixer2Input4: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer2InputRate4: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer2SolidContent4: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer2Temp4: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer2RpmLow4: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer2RpmHigh4: number;

  @Column({ type: 'time', nullable: true })
  pdMixer2StartTime4: string;

  @Column({ type: 'time', nullable: true })
  pdMixer2EndTime4: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  pdMixer2Input5: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer2InputRate5: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer2SolidContent5: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer2Temp5: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer2RpmLow5: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer2RpmHigh5: number;

  @Column({ type: 'time', nullable: true })
  pdMixer2StartTime5: string;

  @Column({ type: 'time', nullable: true })
  pdMixer2EndTime5: string;

  // Viscometer 2
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  viscometer2Input: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  viscometer2InputRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  viscometer2SolidContent: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  viscometer2Temp: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  viscometer2RpmLow: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  viscometer2RpmHigh: number;

  @Column({ type: 'time', nullable: true })
  viscometer2StartTime: string;

  @Column({ type: 'time', nullable: true })
  viscometer2EndTime: string;

  // PD Mixer 3
  @Column({ type: 'varchar', length: 100, nullable: true })
  pdMixer3Name: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  pdMixer3Input1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer3InputRate1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer3SolidContent1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer3Temp1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer3RpmLow1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer3RpmHigh1: number;

  @Column({ type: 'time', nullable: true })
  pdMixer3StartTime1: string;

  @Column({ type: 'time', nullable: true })
  pdMixer3EndTime1: string;

  // Viscometer 3
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  viscometer3Input: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  viscometer3InputRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  viscometer3SolidContent: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  viscometer3Temp: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  viscometer3RpmLow: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  viscometer3RpmHigh: number;

  @Column({ type: 'time', nullable: true })
  viscometer3StartTime: string;

  @Column({ type: 'time', nullable: true })
  viscometer3EndTime: string;

  // PD Mixer 4
  @Column({ type: 'varchar', length: 100, nullable: true })
  pdMixer4Name: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  pdMixer4Input1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer4InputRate1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer4SolidContent1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer4Temp1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer4RpmLow1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pdMixer4RpmHigh1: number;

  @Column({ type: 'time', nullable: true })
  pdMixer4StartTime1: string;

  @Column({ type: 'time', nullable: true })
  pdMixer4EndTime1: string;
}
