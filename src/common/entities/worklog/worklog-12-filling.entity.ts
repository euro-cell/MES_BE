import { Entity, Column } from 'typeorm';
import { WorklogBase } from './worklog-00-base.entity';

@Entity('worklog_fillings')
export class WorklogFilling extends WorklogBase {
  // ===== A. 자재 투입 정보 (Material Input) =====

  // 전해액
  @Column({ type: 'varchar', length: 20, nullable: true })
  electrolyteLot: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  electrolyteManufacturer: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  electrolyteSpec: string;

  @Column({ type: 'smallint', nullable: true })
  electrolyteUsage: number;

  // ===== B. 생산 정보 (Production Info) =====

  // 필링
  @Column({ type: 'smallint', nullable: true })
  fillingWorkQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  fillingGoodQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  fillingDefectQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  fillingDiscardQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  fillingDefectRate: number;

  // 웨이팅
  @Column({ type: 'smallint', nullable: true })
  waitingWorkQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  waitingGoodQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  waitingDefectQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  waitingDiscardQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  waitingDefectRate: number;

  // ===== C. 공정 조건 (Process Conditions) =====

  // 필링
  @Column({ type: 'smallint', nullable: true })
  fillingEquipmentInjectionAmount: number;

  @Column({ type: 'smallint', nullable: true })
  fillingSpecInjectionAmount: number;

  @Column({ type: 'smallint', nullable: true })
  fillingInjectionSpeed: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  fillingSpecificGravity: number;

  // 웨이팅 구분 1
  @Column({ type: 'smallint', nullable: true })
  waiting1RepeatCount: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  waiting1PressureRange: string;

  @Column({ type: 'smallint', nullable: true })
  waiting1HoldTime: number;

  // 웨이팅 구분 2
  @Column({ type: 'smallint', nullable: true })
  waiting2RepeatCount: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  waiting2PressureRange: string;

  @Column({ type: 'smallint', nullable: true })
  waiting2HoldTime: number;

  // 웨이팅 구분 3
  @Column({ type: 'smallint', nullable: true })
  waiting3RepeatCount: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  waiting3PressureRange: string;

  @Column({ type: 'smallint', nullable: true })
  waiting3HoldTime: number;
}
