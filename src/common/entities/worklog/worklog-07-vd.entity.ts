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

  // 1차 - 상부
  @Column({ type: 'varchar', length: 20, nullable: true })
  upperLot1: string;

  @Column({ type: 'smallint', nullable: true })
  upperInputQuantity1: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  upperInputOutputTime1: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  upperMoistureMeasurement1: number;

  // 1차 - 하부
  @Column({ type: 'varchar', length: 20, nullable: true })
  lowerLot1: string;

  @Column({ type: 'smallint', nullable: true })
  lowerInputQuantity1: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  lowerInputOutputTime1: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  lowerMoistureMeasurement1: number;

  // 2차 - 상부
  @Column({ type: 'varchar', length: 20, nullable: true })
  upperLot2: string;

  @Column({ type: 'smallint', nullable: true })
  upperInputQuantity2: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  upperInputOutputTime2: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  upperMoistureMeasurement2: number;

  // 2차 - 하부
  @Column({ type: 'varchar', length: 20, nullable: true })
  lowerLot2: string;

  @Column({ type: 'smallint', nullable: true })
  lowerInputQuantity2: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  lowerInputOutputTime2: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  lowerMoistureMeasurement2: number;

  // 3차 - 상부
  @Column({ type: 'varchar', length: 20, nullable: true })
  upperLot3: string;

  @Column({ type: 'smallint', nullable: true })
  upperInputQuantity3: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  upperInputOutputTime3: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  upperMoistureMeasurement3: number;

  // 3차 - 하부
  @Column({ type: 'varchar', length: 20, nullable: true })
  lowerLot3: string;

  @Column({ type: 'smallint', nullable: true })
  lowerInputQuantity3: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  lowerInputOutputTime3: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  lowerMoistureMeasurement3: number;

  // 4차 - 상부
  @Column({ type: 'varchar', length: 20, nullable: true })
  upperLot4: string;

  @Column({ type: 'smallint', nullable: true })
  upperInputQuantity4: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  upperInputOutputTime4: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  upperMoistureMeasurement4: number;

  // 4차 - 하부
  @Column({ type: 'varchar', length: 20, nullable: true })
  lowerLot4: string;

  @Column({ type: 'smallint', nullable: true })
  lowerInputQuantity4: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  lowerInputOutputTime4: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  lowerMoistureMeasurement4: number;

  // 5차 - 상부
  @Column({ type: 'varchar', length: 20, nullable: true })
  upperLot5: string;

  @Column({ type: 'smallint', nullable: true })
  upperInputQuantity5: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  upperInputOutputTime5: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  upperMoistureMeasurement5: number;

  // 5차 - 하부
  @Column({ type: 'varchar', length: 20, nullable: true })
  lowerLot5: string;

  @Column({ type: 'smallint', nullable: true })
  lowerInputQuantity5: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  lowerInputOutputTime5: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  lowerMoistureMeasurement5: number;

  // ===== C. 공정 조건 (Process Conditions) =====

  @Column({ type: 'smallint', nullable: true })
  vacuumDegreeSetting: number;

  @Column({ type: 'smallint', nullable: true })
  upperSetTemperature: number;

  @Column({ type: 'smallint', nullable: true })
  lowerSetTemperature: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  upperTimerTime: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  lowerTimerTime: string;
}
