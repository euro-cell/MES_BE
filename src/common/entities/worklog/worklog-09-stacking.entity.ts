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

  @Column({ type: 'varchar', length: 11, nullable: true })
  jr1WorkTime: string;

  // JR 번호 2
  @Column({ type: 'varchar', length: 50, nullable: true })
  jr2Range: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  jr2CathodeLot: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  jr2AnodeLot: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  jr2SeparatorLot: string;

  @Column({ type: 'varchar', length: 11, nullable: true })
  jr2WorkTime: string;

  // JR 번호 3
  @Column({ type: 'varchar', length: 50, nullable: true })
  jr3Range: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  jr3CathodeLot: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  jr3AnodeLot: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  jr3SeparatorLot: string;

  @Column({ type: 'varchar', length: 11, nullable: true })
  jr3WorkTime: string;

  // JR 번호 4
  @Column({ type: 'varchar', length: 50, nullable: true })
  jr4Range: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  jr4CathodeLot: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  jr4AnodeLot: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  jr4SeparatorLot: string;

  @Column({ type: 'varchar', length: 11, nullable: true })
  jr4WorkTime: string;

  // JR 번호 5
  @Column({ type: 'varchar', length: 50, nullable: true })
  jr5Range: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  jr5CathodeLot: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  jr5AnodeLot: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  jr5SeparatorLot: string;

  @Column({ type: 'varchar', length: 11, nullable: true })
  jr5WorkTime: string;

  // JR 번호 6
  @Column({ type: 'varchar', length: 50, nullable: true })
  jr6Range: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  jr6CathodeLot: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  jr6AnodeLot: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  jr6SeparatorLot: string;

  @Column({ type: 'varchar', length: 11, nullable: true })
  jr6WorkTime: string;

  // JR 번호 7
  @Column({ type: 'varchar', length: 50, nullable: true })
  jr7Range: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  jr7CathodeLot: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  jr7AnodeLot: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  jr7SeparatorLot: string;

  @Column({ type: 'varchar', length: 11, nullable: true })
  jr7WorkTime: string;

  // JR 번호 8
  @Column({ type: 'varchar', length: 50, nullable: true })
  jr8Range: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  jr8CathodeLot: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  jr8AnodeLot: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  jr8SeparatorLot: string;

  @Column({ type: 'varchar', length: 11, nullable: true })
  jr8WorkTime: string;

  // 전극 파손 수량 (통합)
  @Column({ type: 'smallint', nullable: true })
  cathodeDefect: number;

  @Column({ type: 'smallint', nullable: true })
  anodeDefect: number;

  // ===== C. 공정 조건 (Process Conditions) =====

  @Column({ type: 'smallint', nullable: true })
  jellyRollWeight: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  jellyRollThickness: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  separatorTopBottomDimension: number;

  @Column({ type: 'smallint', nullable: true })
  stackCount: number;

  @Column({ type: 'smallint', nullable: true })
  hipotVoltage: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cathodeThickness: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  anodeThickness: number;
}
