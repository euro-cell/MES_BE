import { Entity, Column } from 'typeorm';
import { WorklogBase } from './worklog-00-base.entity';

@Entity('worklog_sealings')
export class WorklogSealing extends WorklogBase {
  // ===== A. 자재 투입 정보 (Material Input) =====

  @Column({ type: 'varchar', length: 20, nullable: true })
  pouchLot: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  pouchManufacturer: string;

  @Column({ type: 'smallint', nullable: true })
  pouchDepth: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  pouchInputQuantity: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  pouchUsage: string;

  // ===== B. 생산 정보 (Production Info) =====

  // 탑
  @Column({ type: 'varchar', length: 20, nullable: true })
  topJrNumber: string;

  @Column({ type: 'smallint', nullable: true })
  topWorkQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  topGoodQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  topDefectQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  topDiscardQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  topDefectRate: number;

  // 사이드
  @Column({ type: 'varchar', length: 20, nullable: true })
  sideJrNumber: string;

  @Column({ type: 'smallint', nullable: true })
  sideWorkQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  sideGoodQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  sideDefectQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  sideDiscardQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  sideDefectRate: number;

  // 하이팟3
  @Column({ type: 'varchar', length: 20, nullable: true })
  hipot3JrNumber: string;

  @Column({ type: 'smallint', nullable: true })
  hipot3WorkQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  hipot3GoodQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  hipot3DefectQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  hipot3DiscardQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  hipot3DefectRate: number;

  // ===== C. 공정 조건 (Process Conditions) =====

  // 탑
  @Column({ type: 'varchar', nullable: true })
  topTemperature: string;

  @Column({ type: 'varchar', nullable: true })
  topPressure: string;

  @Column({ type: 'smallint', nullable: true })
  topSealingTime: number;

  @Column({ type: 'text', nullable: true })
  topChecklist: string;

  // 사이드
  @Column({ type: 'varchar', nullable: true })
  sideTemperature: string;

  @Column({ type: 'varchar', nullable: true })
  sidePressure: string;

  @Column({ type: 'smallint', nullable: true })
  sideSealingTime: number;

  @Column({ type: 'text', nullable: true })
  sideChecklist: string;

  // 바텀
  @Column({ type: 'varchar', nullable: true })
  bottomTemperature: string;

  @Column({ type: 'varchar', nullable: true })
  bottomPressure: string;

  @Column({ type: 'smallint', nullable: true })
  bottomSealingTime: number;

  @Column({ type: 'text', nullable: true })
  bottomChecklist: string;

  // 하이팟
  @Column({ type: 'smallint', nullable: true })
  hipotVoltage: number;

  @Column({ type: 'smallint', nullable: true })
  hipotTime: number;

  // ===== D. 비고 (Remarks) =====

  @Column({ type: 'text', nullable: true })
  remarkTop: string;

  @Column({ type: 'text', nullable: true })
  remarkSide: string;
}
