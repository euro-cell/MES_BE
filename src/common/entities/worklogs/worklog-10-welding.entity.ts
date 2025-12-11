import { Entity, Column } from 'typeorm';
import { WorklogBase } from './worklog-00-base.entity';

@Entity('worklog_weldings')
export class WorklogWelding extends WorklogBase {
  // ===== A. 자재 투입 정보 (Material Input) =====

  // 리드탭
  @Column({ type: 'varchar', length: 20, nullable: true })
  leadTabLot: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  leadTabManufacturer: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  leadTabSpec: string;

  @Column({ type: 'smallint', nullable: true })
  leadTabUsage: number;

  // PI tape
  @Column({ type: 'varchar', length: 20, nullable: true })
  piTapeLot: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  piTapeManufacturer: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  piTapeSpec: string;

  @Column({ type: 'smallint', nullable: true })
  piTapeUsage: number;

  // ===== B. 생산 정보 (Production Info) =====

  // 프리웰딩
  @Column({ type: 'varchar', length: 20, nullable: true })
  preWeldingJrNumber: string;

  @Column({ type: 'smallint', nullable: true })
  preWeldingWorkQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  preWeldingGoodQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  preWeldingDefectQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  preWeldingDiscardQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  preWeldingDefectRate: number;

  // 메인웰딩
  @Column({ type: 'varchar', length: 20, nullable: true })
  mainWeldingJrNumber: string;

  @Column({ type: 'smallint', nullable: true })
  mainWeldingWorkQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  mainWeldingGoodQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  mainWeldingDefectQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  mainWeldingDiscardQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  mainWeldingDefectRate: number;

  // 하이팟2
  @Column({ type: 'varchar', length: 20, nullable: true })
  hipot2JrNumber: string;

  @Column({ type: 'smallint', nullable: true })
  hipot2WorkQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  hipot2GoodQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  hipot2DefectQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  hipot2DiscardQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  hipot2DefectRate: number;

  // 테이핑
  @Column({ type: 'varchar', length: 20, nullable: true })
  tapingJrNumber: string;

  @Column({ type: 'smallint', nullable: true })
  tapingWorkQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  tapingGoodQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  tapingDefectQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  tapingDiscardQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tapingDefectRate: number;

  // ===== C. 공정 조건 (Process Conditions) =====

  // 프리웰딩
  @Column({ type: 'smallint', nullable: true })
  preWeldingEnergy: number;

  @Column({ type: 'smallint', nullable: true })
  preWeldingAmplitude: number;

  @Column({ type: 'smallint', nullable: true })
  preWeldingStopper: number;

  @Column({ type: 'smallint', nullable: true })
  preWeldingPressure: number;

  @Column({ type: 'smallint', nullable: true })
  preWeldingHoldTime: number;

  // 메인웰딩
  @Column({ type: 'smallint', nullable: true })
  mainWeldingEnergy: number;

  @Column({ type: 'smallint', nullable: true })
  mainWeldingAmplitude: number;

  @Column({ type: 'smallint', nullable: true })
  mainWeldingStopper: number;

  @Column({ type: 'smallint', nullable: true })
  mainWeldingPressure: number;

  @Column({ type: 'smallint', nullable: true })
  mainWeldingHoldTime: number;

  // 하이팟
  @Column({ type: 'smallint', nullable: true })
  hipotVoltage: number;

  @Column({ type: 'smallint', nullable: true })
  hipotTime: number;

  // 테이핑
  @Column({ type: 'smallint', nullable: true })
  tapingLength: number;
}
