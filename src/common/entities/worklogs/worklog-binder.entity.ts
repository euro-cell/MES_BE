import { Entity, Column } from 'typeorm';
import { WorklogBase } from './worklog-base.entity';

@Entity('worklog_binders')
export class WorklogBinder extends WorklogBase {
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

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  binderSolution: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lot: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  viscosity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  solidContent1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  solidContent2: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  solidContent3: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  nmpWeightInput: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  nmpWeightTemp: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  nmpWeightRpmLow: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  nmpWeightRpmHigh: number;

  @Column({ type: 'time', nullable: true })
  nmpWeightStartTime: string;

  @Column({ type: 'time', nullable: true })
  nmpWeightEndTime: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  binderWeightInput: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  binderWeightTemp: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  binderWeightRpmLow: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  binderWeightRpmHigh: number;

  @Column({ type: 'time', nullable: true })
  binderWeightStartTime: string;

  @Column({ type: 'time', nullable: true })
  binderWeightEndTime: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  mixing1Input: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  mixing1Temp: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  mixing1RpmLow: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  mixing1RpmHigh: number;

  @Column({ type: 'time', nullable: true })
  mixing1StartTime: string;

  @Column({ type: 'time', nullable: true })
  mixing1EndTime: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  scrappingInput: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  scrappingTemp: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  scrappingRpmLow: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  scrappingRpmHigh: number;

  @Column({ type: 'time', nullable: true })
  scrappingStartTime: string;

  @Column({ type: 'time', nullable: true })
  scrappingEndTime: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  mixing2Input: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  mixing2Temp: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  mixing2RpmLow: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  mixing2RpmHigh: number;

  @Column({ type: 'time', nullable: true })
  mixing2StartTime: string;

  @Column({ type: 'time', nullable: true })
  mixing2EndTime: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  stabilizationInput: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  stabilizationTemp: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  stabilizationRpmLow: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  stabilizationRpmHigh: number;

  @Column({ type: 'time', nullable: true })
  stabilizationStartTime: string;

  @Column({ type: 'time', nullable: true })
  stabilizationEndTime: string;
}
