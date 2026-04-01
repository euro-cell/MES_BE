import { Entity, Column } from 'typeorm';
import { WorklogBase } from './worklog-00-base.entity';

@Entity('worklog_gradings')
export class WorklogGrading extends WorklogBase {
  // ===== A. 자재 투입 정보 (Material Input) =====

  @Column({ type: 'varchar', length: 50, nullable: true })
  cellNumberRange: string;

  // ===== B. 생산 정보 (Production Info) =====

  // OCV2
  @Column({ type: 'smallint', nullable: true })
  ocv2InputQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  ocv2GoodQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  ocv2DefectQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  ocv2DiscardQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  ocv2DefectRate: number;

  // Lot (OCV2와 Grading 사이)
  @Column({ type: 'varchar', length: 50, nullable: true })
  lot1Range: string;

  // Grading
  @Column({ type: 'smallint', nullable: true })
  gradingInputQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  gradingGoodQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  gradingDefectQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  gradingDiscardQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  gradingDefectRate: number;

  // Grading 호기 1
  @Column({ type: 'varchar', length: 20, nullable: true })
  grading1UnitNumber: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  grading1CellNumberRange: string;

  @Column({ type: 'smallint', nullable: true })
  grading1Quantity: number;

  // Grading 호기 2
  @Column({ type: 'varchar', length: 20, nullable: true })
  grading2UnitNumber: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  grading2CellNumberRange: string;

  @Column({ type: 'smallint', nullable: true })
  grading2Quantity: number;

  // Grading 호기 3
  @Column({ type: 'varchar', length: 20, nullable: true })
  grading3UnitNumber: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  grading3CellNumberRange: string;

  @Column({ type: 'smallint', nullable: true })
  grading3Quantity: number;

  // Grading 호기 4
  @Column({ type: 'varchar', length: 20, nullable: true })
  grading4UnitNumber: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  grading4CellNumberRange: string;

  @Column({ type: 'smallint', nullable: true })
  grading4Quantity: number;

  // Grading 호기 5
  @Column({ type: 'varchar', length: 20, nullable: true })
  grading5UnitNumber: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  grading5CellNumberRange: string;

  @Column({ type: 'smallint', nullable: true })
  grading5Quantity: number;

  // OCV3
  @Column({ type: 'smallint', nullable: true })
  ocv3InputQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  ocv3GoodQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  ocv3DefectQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  ocv3DiscardQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  ocv3DefectRate: number;

  // Lot (OCV3 다음)
  @Column({ type: 'varchar', length: 50, nullable: true })
  lot2Range: string;

  // ===== C. 공정 조건 (Process Conditions) =====

  // Grading
  @Column({ type: 'varchar', length: 50, nullable: true })
  gradingVoltageCondition: string;

  @Column({ type: 'smallint', nullable: true })
  gradingLowerVoltage: number;

  @Column({ type: 'smallint', nullable: true })
  gradingUpperVoltage: number;

  @Column({ type: 'smallint', nullable: true })
  gradingAppliedCurrent: number;

  @Column({ type: 'smallint', nullable: true })
  gradingTemperature: number;

  // OCV2
  @Column({ type: 'varchar', length: 100, nullable: true })
  ocv2MeasurementEquipmentName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ocv2VoltageSpec: string;

  // OCV3
  @Column({ type: 'varchar', length: 100, nullable: true })
  ocv3MeasurementEquipmentName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ocv3VoltageSpec: string;
}
