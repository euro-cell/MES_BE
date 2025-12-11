import { Entity, Column } from 'typeorm';
import { WorklogBase } from './worklog-00-base.entity';

@Entity('worklog_stackings')
export class WorklogStacking extends WorklogBase {
  // ===== A. 자재 투입 정보 (Material Input) =====

  // 분리막
  @Column({ type: 'varchar', length: 20, nullable: true })
  separatorLot: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  separatorManufacturer: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  separatorSpec: string;

  @Column({ type: 'smallint', nullable: true })
  separatorInputQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  separatorUsage: number;

  // 양극 매거진 로트 1~3
  @Column({ type: 'varchar', length: 20, nullable: true })
  cathodeMagazineLot1: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  cathodeMagazineLot2: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  cathodeMagazineLot3: string;

  // 음극 매거진 로트 1~3
  @Column({ type: 'varchar', length: 20, nullable: true })
  anodeMagazineLot1: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  anodeMagazineLot2: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  anodeMagazineLot3: string;

  // ===== B. 생산 정보 (Production Info) =====

  // 스택
  @Column({ type: 'smallint', nullable: true })
  stackActualInput: number;

  @Column({ type: 'smallint', nullable: true })
  stackGoodQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  stackDefectQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  stackDiscardQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  stackDefectRate: number;

  // 하이팟1
  @Column({ type: 'smallint', nullable: true })
  hipot1ActualInput: number;

  @Column({ type: 'smallint', nullable: true })
  hipot1GoodQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  hipot1DefectQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  hipot1DiscardQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  hipot1DefectRate: number;

  // JR 번호 1
  @Column({ type: 'varchar', length: 50, nullable: true })
  jr1Range: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  jr1CathodeLot: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  jr1AnodeLot: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  jr1SeparatorLot: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  jr1WorkTime: string;

  @Column({ type: 'smallint', nullable: true })
  jr1ElectrodeDefect: number;

  // JR 번호 2
  @Column({ type: 'varchar', length: 50, nullable: true })
  jr2Range: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  jr2CathodeLot: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  jr2AnodeLot: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  jr2SeparatorLot: string;

  @Column({ type: 'time', nullable: true })
  jr2WorkTime: string;

  @Column({ type: 'smallint', nullable: true })
  jr2ElectrodeDefect: number;

  // JR 번호 3
  @Column({ type: 'varchar', length: 50, nullable: true })
  jr3Range: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  jr3CathodeLot: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  jr3AnodeLot: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  jr3SeparatorLot: string;

  @Column({ type: 'time', nullable: true })
  jr3WorkTime: string;

  @Column({ type: 'smallint', nullable: true })
  jr3ElectrodeDefect: number;

  // JR 번호 4
  @Column({ type: 'varchar', length: 50, nullable: true })
  jr4Range: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  jr4CathodeLot: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  jr4AnodeLot: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  jr4SeparatorLot: string;

  @Column({ type: 'time', nullable: true })
  jr4WorkTime: string;

  @Column({ type: 'smallint', nullable: true })
  jr4ElectrodeDefect: number;

  // ===== C. 공정 조건 (Process Conditions) =====

  @Column({ type: 'smallint', nullable: true })
  jellyRollWeight: number;

  @Column({ type: 'smallint', nullable: true })
  jellyRollThickness: number;

  @Column({ type: 'smallint', nullable: true })
  separatorTopBottomDimension: number;

  @Column({ type: 'smallint', nullable: true })
  stackCount: number;

  @Column({ type: 'smallint', nullable: true })
  hipotVoltage: number;
}
