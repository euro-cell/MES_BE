import { Entity, Column } from 'typeorm';
import { WorklogBase } from './worklog-00-base.entity';

@Entity('worklog_vds')
export class WorklogVd extends WorklogBase {
  // ===== A. 자재 투입 정보 (Material Input) =====

  // 양극 매거진 LOT (5칸)
  @Column({ type: 'varchar', length: 20, nullable: true })
  cathodeMagazineLot1: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  cathodeMagazineLot2: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  cathodeMagazineLot3: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  cathodeMagazineLot4: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  cathodeMagazineLot5: string;

  // 음극 매거진 LOT (5칸)
  @Column({ type: 'varchar', length: 20, nullable: true })
  anodeMagazineLot1: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  anodeMagazineLot2: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  anodeMagazineLot3: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  anodeMagazineLot4: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  anodeMagazineLot5: string;

  // ===== B. 생산 정보 (Production Info - 5회 반복) =====

  // 1차 - 양극
  @Column({ type: 'varchar', length: 20, nullable: true })
  cathodeLot1: string;

  @Column({ type: 'smallint', nullable: true })
  cathodeInputQuantity1: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  cathodeInputOutputTime1: string;

  @Column({ type: 'smallint', nullable: true })
  cathodeMoistureMeasurement1: number;

  // 1차 - 음극
  @Column({ type: 'varchar', length: 20, nullable: true })
  anodeLot1: string;

  @Column({ type: 'smallint', nullable: true })
  anodeInputQuantity1: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  anodeInputOutputTime1: string;

  @Column({ type: 'smallint', nullable: true })
  anodeMoistureMeasurement1: number;

  // 2차 - 양극
  @Column({ type: 'varchar', length: 20, nullable: true })
  cathodeLot2: string;

  @Column({ type: 'smallint', nullable: true })
  cathodeInputQuantity2: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  cathodeInputOutputTime2: string;

  @Column({ type: 'smallint', nullable: true })
  cathodeMoistureMeasurement2: number;

  // 2차 - 음극
  @Column({ type: 'varchar', length: 20, nullable: true })
  anodeLot2: string;

  @Column({ type: 'smallint', nullable: true })
  anodeInputQuantity2: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  anodeInputOutputTime2: string;

  @Column({ type: 'smallint', nullable: true })
  anodeMoistureMeasurement2: number;

  // 3차 - 양극
  @Column({ type: 'varchar', length: 20, nullable: true })
  cathodeLot3: string;

  @Column({ type: 'smallint', nullable: true })
  cathodeInputQuantity3: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  cathodeInputOutputTime3: string;

  @Column({ type: 'smallint', nullable: true })
  cathodeMoistureMeasurement3: number;

  // 3차 - 음극
  @Column({ type: 'varchar', length: 20, nullable: true })
  anodeLot3: string;

  @Column({ type: 'smallint', nullable: true })
  anodeInputQuantity3: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  anodeInputOutputTime3: string;

  @Column({ type: 'smallint', nullable: true })
  anodeMoistureMeasurement3: number;

  // 4차 - 양극
  @Column({ type: 'varchar', length: 20, nullable: true })
  cathodeLot4: string;

  @Column({ type: 'smallint', nullable: true })
  cathodeInputQuantity4: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  cathodeInputOutputTime4: string;

  @Column({ type: 'smallint', nullable: true })
  cathodeMoistureMeasurement4: number;

  // 4차 - 음극
  @Column({ type: 'varchar', length: 20, nullable: true })
  anodeLot4: string;

  @Column({ type: 'smallint', nullable: true })
  anodeInputQuantity4: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  anodeInputOutputTime4: string;

  @Column({ type: 'smallint', nullable: true })
  anodeMoistureMeasurement4: number;

  // 5차 - 양극
  @Column({ type: 'varchar', length: 20, nullable: true })
  cathodeLot5: string;

  @Column({ type: 'smallint', nullable: true })
  cathodeInputQuantity5: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  cathodeInputOutputTime5: string;

  @Column({ type: 'smallint', nullable: true })
  cathodeMoistureMeasurement5: number;

  // 5차 - 음극
  @Column({ type: 'varchar', length: 20, nullable: true })
  anodeLot5: string;

  @Column({ type: 'smallint', nullable: true })
  anodeInputQuantity5: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  anodeInputOutputTime5: string;

  @Column({ type: 'smallint', nullable: true })
  anodeMoistureMeasurement5: number;

  // ===== C. 공정 조건 (Process Conditions) =====

  @Column({ type: 'smallint', nullable: true })
  vacuumDegreeSetting: number;

  @Column({ type: 'smallint', nullable: true })
  cathodeSetTemperature: number;

  @Column({ type: 'smallint', nullable: true })
  anodeSetTemperature: number;

  @Column({ type: 'smallint', nullable: true })
  cathodeTimerTime: number;

  @Column({ type: 'smallint', nullable: true })
  anodeTimerTime: number;
}
