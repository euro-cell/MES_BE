import { Entity, Column } from 'typeorm';
import { WorklogBase } from './worklog-00-base.entity';

@Entity('worklog_presses')
export class WorklogPress extends WorklogBase {
  // ===== A. 자재 투입 정보 (Material Input) =====

  // 코팅된 LOT (5칸)
  @Column({ type: 'varchar', length: 20, nullable: true })
  coatingRollLot1: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  coatingRollLot2: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  coatingRollLot3: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  coatingRollLot4: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  coatingRollLot5: string;

  // 목표 두께
  @Column({ type: 'smallint', nullable: true })
  targetThickness: number;

  // ===== B. 생산 정보 (Production Info - 5회 반복) =====

  // 1차
  @Column({ type: 'varchar', length: 20, nullable: true })
  coatingLot1: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  pressLot1: string;

  @Column({ type: 'smallint', nullable: true })
  coatingQuantity1: number;

  @Column({ type: 'smallint', nullable: true })
  pressQuantity1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaFront1M: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaFront1C: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaFront1D: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaRear1M: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaRear1C: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaRear1D: number;

  @Column({ type: 'smallint', nullable: true })
  thicknessFront1M: number;

  @Column({ type: 'smallint', nullable: true })
  thicknessFront1C: number;

  @Column({ type: 'smallint', nullable: true })
  thicknessFront1D: number;

  @Column({ type: 'smallint', nullable: true })
  thicknessRear1M: number;

  @Column({ type: 'smallint', nullable: true })
  thicknessRear1C: number;

  @Column({ type: 'smallint', nullable: true })
  thicknessRear1D: number;

  // 2차
  @Column({ type: 'varchar', length: 20, nullable: true })
  coatingLot2: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  pressLot2: string;

  @Column({ type: 'smallint', nullable: true })
  coatingQuantity2: number;

  @Column({ type: 'smallint', nullable: true })
  pressQuantity2: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaFront2M: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaFront2C: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaFront2D: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaRear2M: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaRear2C: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaRear2D: number;

  @Column({ type: 'smallint', nullable: true })
  thicknessFront2M: number;

  @Column({ type: 'smallint', nullable: true })
  thicknessFront2C: number;

  @Column({ type: 'smallint', nullable: true })
  thicknessFront2D: number;

  @Column({ type: 'smallint', nullable: true })
  thicknessRear2M: number;

  @Column({ type: 'smallint', nullable: true })
  thicknessRear2C: number;

  @Column({ type: 'smallint', nullable: true })
  thicknessRear2D: number;

  // 3차
  @Column({ type: 'varchar', length: 20, nullable: true })
  coatingLot3: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  pressLot3: string;

  @Column({ type: 'smallint', nullable: true })
  coatingQuantity3: number;

  @Column({ type: 'smallint', nullable: true })
  pressQuantity3: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaFront3M: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaFront3C: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaFront3D: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaRear3M: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaRear3C: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaRear3D: number;

  @Column({ type: 'smallint', nullable: true })
  thicknessFront3M: number;

  @Column({ type: 'smallint', nullable: true })
  thicknessFront3C: number;

  @Column({ type: 'smallint', nullable: true })
  thicknessFront3D: number;

  @Column({ type: 'smallint', nullable: true })
  thicknessRear3M: number;

  @Column({ type: 'smallint', nullable: true })
  thicknessRear3C: number;

  @Column({ type: 'smallint', nullable: true })
  thicknessRear3D: number;

  // 4차
  @Column({ type: 'varchar', length: 20, nullable: true })
  coatingLot4: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  pressLot4: string;

  @Column({ type: 'smallint', nullable: true })
  coatingQuantity4: number;

  @Column({ type: 'smallint', nullable: true })
  pressQuantity4: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaFront4M: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaFront4C: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaFront4D: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaRear4M: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaRear4C: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaRear4D: number;

  @Column({ type: 'smallint', nullable: true })
  thicknessFront4M: number;

  @Column({ type: 'smallint', nullable: true })
  thicknessFront4C: number;

  @Column({ type: 'smallint', nullable: true })
  thicknessFront4D: number;

  @Column({ type: 'smallint', nullable: true })
  thicknessRear4M: number;

  @Column({ type: 'smallint', nullable: true })
  thicknessRear4C: number;

  @Column({ type: 'smallint', nullable: true })
  thicknessRear4D: number;

  // 5차
  @Column({ type: 'varchar', length: 20, nullable: true })
  coatingLot5: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  pressLot5: string;

  @Column({ type: 'smallint', nullable: true })
  coatingQuantity5: number;

  @Column({ type: 'smallint', nullable: true })
  pressQuantity5: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaFront5M: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaFront5C: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaFront5D: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaRear5M: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaRear5C: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaRear5D: number;

  @Column({ type: 'smallint', nullable: true })
  thicknessFront5M: number;

  @Column({ type: 'smallint', nullable: true })
  thicknessFront5C: number;

  @Column({ type: 'smallint', nullable: true })
  thicknessFront5D: number;

  @Column({ type: 'smallint', nullable: true })
  thicknessRear5M: number;

  @Column({ type: 'smallint', nullable: true })
  thicknessRear5C: number;

  @Column({ type: 'smallint', nullable: true })
  thicknessRear5D: number;

  // ===== C. 공정 조건 (Process Conditions) =====

  // 장력
  @Column({ type: 'smallint', nullable: true })
  tensionUnT: number;

  @Column({ type: 'smallint', nullable: true })
  tensionReT: number;

  // 프레스 관련
  @Column({ type: 'smallint', nullable: true })
  pressSpeed: number;

  @Column({ type: 'smallint', nullable: true })
  pressureCondition: number;

  // Roll Gap
  @Column({ type: 'smallint', nullable: true })
  rollGapLeft: number;

  @Column({ type: 'smallint', nullable: true })
  rollGapRight: number;

  // Roll 온도
  @Column({ type: 'smallint', nullable: true })
  rollTemperatureMain: number;

  @Column({ type: 'smallint', nullable: true })
  rollTemperatureInfeed: number;
}
