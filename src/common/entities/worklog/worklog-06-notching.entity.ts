import { Entity, Column } from 'typeorm';
import { WorklogBase } from './worklog-00-base.entity';

@Entity('worklog_notchings')
export class WorklogNotching extends WorklogBase {
  // ===== A. 자재 투입 정보 (Material Input) =====

  // 프레스된 LOT (5칸)
  @Column({ type: 'varchar', length: 20, nullable: true })
  pressRollLot1: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  pressRollLot2: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  pressRollLot3: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  pressRollLot4: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  pressRollLot5: string;

  // ===== B. 생산 정보 (Production Info - 5회 반복) =====

  // 1차
  @Column({ type: 'varchar', length: 20, nullable: true })
  pressLot1: string;

  @Column({ type: 'int', nullable: true })
  pressQuantity1: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  notchingLot1: string;

  @Column({ type: 'int', nullable: true })
  notchingQuantity1: number;

  @Column({ type: 'int', nullable: true })
  defectQuantity1: number;

  @Column({ type: 'int', nullable: true })
  goodQuantity1: number;

  @Column({ type: 'decimal', precision: 10, scale: 1, nullable: true })
  dimension1: number;

  @Column({ type: 'int', nullable: true })
  burr1: number;

  @Column({ type: 'int', nullable: true })
  damage1: number;

  @Column({ type: 'int', nullable: true })
  nonCutting1: number;

  @Column({ type: 'int', nullable: true })
  overTab1: number;

  @Column({ type: 'decimal', precision: 10, scale: 1, nullable: true })
  wide1: number;

  @Column({ type: 'decimal', precision: 10, scale: 1, nullable: true })
  length1: number;

  @Column({ type: 'decimal', precision: 10, scale: 1, nullable: true })
  missMatch1: number;

  // 2차
  @Column({ type: 'varchar', length: 20, nullable: true })
  pressLot2: string;

  @Column({ type: 'int', nullable: true })
  pressQuantity2: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  notchingLot2: string;

  @Column({ type: 'int', nullable: true })
  notchingQuantity2: number;

  @Column({ type: 'int', nullable: true })
  defectQuantity2: number;

  @Column({ type: 'int', nullable: true })
  goodQuantity2: number;

  @Column({ type: 'decimal', precision: 10, scale: 1, nullable: true })
  dimension2: number;

  @Column({ type: 'int', nullable: true })
  burr2: number;

  @Column({ type: 'int', nullable: true })
  damage2: number;

  @Column({ type: 'int', nullable: true })
  nonCutting2: number;

  @Column({ type: 'int', nullable: true })
  overTab2: number;

  @Column({ type: 'decimal', precision: 10, scale: 1, nullable: true })
  wide2: number;

  @Column({ type: 'decimal', precision: 10, scale: 1, nullable: true })
  length2: number;

  @Column({ type: 'decimal', precision: 10, scale: 1, nullable: true })
  missMatch2: number;

  // 3차
  @Column({ type: 'varchar', length: 20, nullable: true })
  pressLot3: string;

  @Column({ type: 'int', nullable: true })
  pressQuantity3: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  notchingLot3: string;

  @Column({ type: 'int', nullable: true })
  notchingQuantity3: number;

  @Column({ type: 'int', nullable: true })
  defectQuantity3: number;

  @Column({ type: 'int', nullable: true })
  goodQuantity3: number;

  @Column({ type: 'decimal', precision: 10, scale: 1, nullable: true })
  dimension3: number;

  @Column({ type: 'int', nullable: true })
  burr3: number;

  @Column({ type: 'int', nullable: true })
  damage3: number;

  @Column({ type: 'int', nullable: true })
  nonCutting3: number;

  @Column({ type: 'int', nullable: true })
  overTab3: number;

  @Column({ type: 'decimal', precision: 10, scale: 1, nullable: true })
  wide3: number;

  @Column({ type: 'decimal', precision: 10, scale: 1, nullable: true })
  length3: number;

  @Column({ type: 'decimal', precision: 10, scale: 1, nullable: true })
  missMatch3: number;

  // 4차
  @Column({ type: 'varchar', length: 20, nullable: true })
  pressLot4: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  notchingLot4: string;

  @Column({ type: 'int', nullable: true })
  pressQuantity4: number;

  @Column({ type: 'int', nullable: true })
  notchingQuantity4: number;

  @Column({ type: 'int', nullable: true })
  defectQuantity4: number;

  @Column({ type: 'int', nullable: true })
  goodQuantity4: number;

  @Column({ type: 'decimal', precision: 10, scale: 1, nullable: true })
  dimension4: number;

  @Column({ type: 'int', nullable: true })
  burr4: number;

  @Column({ type: 'int', nullable: true })
  damage4: number;

  @Column({ type: 'int', nullable: true })
  nonCutting4: number;

  @Column({ type: 'int', nullable: true })
  overTab4: number;

  @Column({ type: 'decimal', precision: 10, scale: 1, nullable: true })
  wide4: number;

  @Column({ type: 'decimal', precision: 10, scale: 1, nullable: true })
  length4: number;

  @Column({ type: 'decimal', precision: 10, scale: 1, nullable: true })
  missMatch4: number;

  // 5차
  @Column({ type: 'varchar', length: 20, nullable: true })
  pressLot5: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  notchingLot5: string;

  @Column({ type: 'int', nullable: true })
  pressQuantity5: number;

  @Column({ type: 'int', nullable: true })
  notchingQuantity5: number;

  @Column({ type: 'int', nullable: true })
  defectQuantity5: number;

  @Column({ type: 'int', nullable: true })
  goodQuantity5: number;

  @Column({ type: 'decimal', precision: 10, scale: 1, nullable: true })
  dimension5: number;

  @Column({ type: 'int', nullable: true })
  burr5: number;

  @Column({ type: 'int', nullable: true })
  damage5: number;

  @Column({ type: 'int', nullable: true })
  nonCutting5: number;

  @Column({ type: 'int', nullable: true })
  overTab5: number;

  @Column({ type: 'decimal', precision: 10, scale: 1, nullable: true })
  wide5: number;

  @Column({ type: 'decimal', precision: 10, scale: 1, nullable: true })
  length5: number;

  @Column({ type: 'decimal', precision: 10, scale: 1, nullable: true })
  missMatch5: number;

  // ===== C. 공정 조건 (Process Conditions) =====

  @Column({ type: 'int', nullable: true })
  tension: number;

  @Column({ type: 'int', nullable: true })
  punchingSpeed: number;
}
