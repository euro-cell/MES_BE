import { Entity, Column } from 'typeorm';
import { WorklogBase } from './worklog-00-base.entity';

@Entity('worklog_vds')
export class WorklogVd extends WorklogBase {
  // ===== A. 자재 투입 정보 (섹션2) =====
  // Lot: upper/lowerLot{오븐번호}{층번호}, 오븐 1~3, 층 1~3

  // 상부 LOT (오븐1)
  @Column({ type: 'varchar', length: 20, nullable: true })
  upperLot11: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  upperLot12: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  upperLot13: string;

  // 상부 LOT (오븐2)
  @Column({ type: 'varchar', length: 20, nullable: true })
  upperLot21: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  upperLot22: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  upperLot23: string;

  // 상부 LOT (오븐3)
  @Column({ type: 'varchar', length: 20, nullable: true })
  upperLot31: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  upperLot32: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  upperLot33: string;

  // 하부 LOT (오븐1)
  @Column({ type: 'varchar', length: 20, nullable: true })
  lowerLot11: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  lowerLot12: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  lowerLot13: string;

  // 하부 LOT (오븐2)
  @Column({ type: 'varchar', length: 20, nullable: true })
  lowerLot21: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  lowerLot22: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  lowerLot23: string;

  // 하부 LOT (오븐3)
  @Column({ type: 'varchar', length: 20, nullable: true })
  lowerLot31: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  lowerLot32: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  lowerLot33: string;

  // 상부 투입량 (오븐1)
  @Column({ type: 'smallint', nullable: true })
  upperLotQty11: number;

  @Column({ type: 'smallint', nullable: true })
  upperLotQty12: number;

  @Column({ type: 'smallint', nullable: true })
  upperLotQty13: number;

  // 상부 투입량 (오븐2)
  @Column({ type: 'smallint', nullable: true })
  upperLotQty21: number;

  @Column({ type: 'smallint', nullable: true })
  upperLotQty22: number;

  @Column({ type: 'smallint', nullable: true })
  upperLotQty23: number;

  // 상부 투입량 (오븐3)
  @Column({ type: 'smallint', nullable: true })
  upperLotQty31: number;

  @Column({ type: 'smallint', nullable: true })
  upperLotQty32: number;

  @Column({ type: 'smallint', nullable: true })
  upperLotQty33: number;

  // 하부 투입량 (오븐1)
  @Column({ type: 'smallint', nullable: true })
  lowerLotQty11: number;

  @Column({ type: 'smallint', nullable: true })
  lowerLotQty12: number;

  @Column({ type: 'smallint', nullable: true })
  lowerLotQty13: number;

  // 하부 투입량 (오븐2)
  @Column({ type: 'smallint', nullable: true })
  lowerLotQty21: number;

  @Column({ type: 'smallint', nullable: true })
  lowerLotQty22: number;

  @Column({ type: 'smallint', nullable: true })
  lowerLotQty23: number;

  // 하부 투입량 (오븐3)
  @Column({ type: 'smallint', nullable: true })
  lowerLotQty31: number;

  @Column({ type: 'smallint', nullable: true })
  lowerLotQty32: number;

  @Column({ type: 'smallint', nullable: true })
  lowerLotQty33: number;

  // ===== B. 생산 정보 (섹션3) =====

  // 상부 투입량 1~3층
  @Column({ type: 'smallint', nullable: true })
  upperInputQuantity1: number;

  @Column({ type: 'smallint', nullable: true })
  upperInputQuantity2: number;

  @Column({ type: 'smallint', nullable: true })
  upperInputQuantity3: number;

  // 상부 수분측정 1~3층
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  upperMoistureMeasurement1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  upperMoistureMeasurement2: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  upperMoistureMeasurement3: number;

  // 하부 투입량 1~3층
  @Column({ type: 'smallint', nullable: true })
  lowerInputQuantity1: number;

  @Column({ type: 'smallint', nullable: true })
  lowerInputQuantity2: number;

  @Column({ type: 'smallint', nullable: true })
  lowerInputQuantity3: number;

  // 하부 수분측정 1~3층
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  lowerMoistureMeasurement1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  lowerMoistureMeasurement2: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  lowerMoistureMeasurement3: number;

  // 상부 두께 before VD: upper/lowerThicknessBefore{층번호}F{오븐번호}
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  upperThicknessBefore1F1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  upperThicknessBefore1F2: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  upperThicknessBefore1F3: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  upperThicknessBefore2F1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  upperThicknessBefore2F2: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  upperThicknessBefore2F3: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  upperThicknessBefore3F1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  upperThicknessBefore3F2: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  upperThicknessBefore3F3: number;

  // 상부 두께 after VD
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  upperThicknessAfter1F1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  upperThicknessAfter1F2: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  upperThicknessAfter1F3: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  upperThicknessAfter2F1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  upperThicknessAfter2F2: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  upperThicknessAfter2F3: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  upperThicknessAfter3F1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  upperThicknessAfter3F2: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  upperThicknessAfter3F3: number;

  // 하부 두께 before VD
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  lowerThicknessBefore1F1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  lowerThicknessBefore1F2: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  lowerThicknessBefore1F3: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  lowerThicknessBefore2F1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  lowerThicknessBefore2F2: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  lowerThicknessBefore2F3: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  lowerThicknessBefore3F1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  lowerThicknessBefore3F2: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  lowerThicknessBefore3F3: number;

  // 하부 두께 after VD
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  lowerThicknessAfter1F1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  lowerThicknessAfter1F2: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  lowerThicknessAfter1F3: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  lowerThicknessAfter2F1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  lowerThicknessAfter2F2: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  lowerThicknessAfter2F3: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  lowerThicknessAfter3F1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  lowerThicknessAfter3F2: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  lowerThicknessAfter3F3: number;

  // 투입/배출 시간 (단일값)
  @Column({ type: 'varchar', length: 50, nullable: true })
  upperInputOutputTime: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  lowerInputOutputTime: string;

  // ===== C. 공정 조건 (섹션4) =====

  @Column({ type: 'smallint', nullable: true })
  vacuumDegreeSetting: number;

  @Column({ type: 'smallint', nullable: true })
  upperSetTemperature: number;

  @Column({ type: 'smallint', nullable: true })
  lowerSetTemperature: number;

  @Column({ type: 'smallint', nullable: true })
  upperTimerTime: number;

  @Column({ type: 'smallint', nullable: true })
  lowerTimerTime: number;

  // ===== D. 설비 정보 (섹션5) =====

  @Column({ type: 'varchar', length: 50, nullable: true })
  equipmentUpperNumber: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  equipmentLowerNumber: string;
}
