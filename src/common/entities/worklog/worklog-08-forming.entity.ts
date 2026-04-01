import { Entity, Column } from 'typeorm';
import { WorklogBase } from './worklog-00-base.entity';

@Entity('worklog_formings')
export class WorklogForming extends WorklogBase {
  // ===== A. 자재 투입 정보 (Material Input) =====

  @Column({ type: 'varchar', length: 20, nullable: true })
  pouchLot: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  pouchManufacturer: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  pouchSpec: string;

  @Column({ type: 'smallint', nullable: true })
  pouchUsage: number;

  // ===== B. 생산 정보 (Production Info) =====

  // 컷팅
  @Column({ type: 'smallint', nullable: true })
  cuttingWorkQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  cuttingGoodQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  cuttingDefectQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  cuttingDiscardQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cuttingDefectRate: number;

  // 포밍
  @Column({ type: 'smallint', nullable: true })
  formingWorkQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  formingGoodQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  formingDefectQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  formingDiscardQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  formingDefectRate: number;

  // 폴딩
  @Column({ type: 'smallint', nullable: true })
  foldingWorkQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  foldingGoodQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  foldingDefectQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  foldingDiscardQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  foldingDefectRate: number;

  // 탑컷팅
  @Column({ type: 'smallint', nullable: true })
  topCuttingWorkQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  topCuttingGoodQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  topCuttingDefectQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  topCuttingDiscardQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  topCuttingDefectRate: number;

  // ===== C. 공정 조건 (Process Conditions) =====

  // 컷팅
  @Column({ type: 'smallint', nullable: true })
  cuttingLength: number;

  @Column({ type: 'text', nullable: true })
  cuttingChecklist: string;

  // 포밍
  @Column({ type: 'smallint', nullable: true })
  formingDepth: number;

  @Column({ type: 'smallint', nullable: true })
  formingStopperHeight: number;

  @Column({ type: 'text', nullable: true })
  formingChecklist: string;

  // 탑컷팅
  @Column({ type: 'smallint', nullable: true })
  topCuttingLength: number;

  @Column({ type: 'text', nullable: true })
  topCuttingChecklist: string;
}
