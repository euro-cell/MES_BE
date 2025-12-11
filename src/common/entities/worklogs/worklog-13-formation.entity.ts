import { Entity, Column } from 'typeorm';
import { WorklogBase } from './worklog-00-base.entity';

@Entity('worklog_formations')
export class WorklogFormation extends WorklogBase {
  // ===== A. 자재 투입 정보 (Material Input) =====

  @Column({ type: 'varchar', length: 50, nullable: true })
  cellNumberRange: string;

  // ===== B. 생산 정보 (Production Info) =====

  // 디가스1
  @Column({ type: 'smallint', nullable: true })
  degas1InputQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  degas1GoodQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  degas1DefectQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  degas1DiscardQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  degas1DefectRate: number;

  // 프리포메이션
  @Column({ type: 'smallint', nullable: true })
  preFormationInputQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  preFormationGoodQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  preFormationDefectQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  preFormationDiscardQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  preFormationDefectRate: number;

  // 프리포메이션 호기 1
  @Column({ type: 'varchar', length: 20, nullable: true })
  preFormation1UnitNumber: string;

  @Column({ type: 'smallint', nullable: true })
  preFormation1Quantity: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  preFormation1CellNumberRange: string;

  // 프리포메이션 호기 2
  @Column({ type: 'varchar', length: 20, nullable: true })
  preFormation2UnitNumber: string;

  @Column({ type: 'smallint', nullable: true })
  preFormation2Quantity: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  preFormation2CellNumberRange: string;

  // 프리포메이션 호기 3
  @Column({ type: 'varchar', length: 20, nullable: true })
  preFormation3UnitNumber: string;

  @Column({ type: 'smallint', nullable: true })
  preFormation3Quantity: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  preFormation3CellNumberRange: string;

  // 프리포메이션 호기 4
  @Column({ type: 'varchar', length: 20, nullable: true })
  preFormation4UnitNumber: string;

  @Column({ type: 'smallint', nullable: true })
  preFormation4Quantity: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  preFormation4CellNumberRange: string;

  // 프리포메이션 호기 5
  @Column({ type: 'varchar', length: 20, nullable: true })
  preFormation5UnitNumber: string;

  @Column({ type: 'smallint', nullable: true })
  preFormation5Quantity: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  preFormation5CellNumberRange: string;

  // 디가스2
  @Column({ type: 'smallint', nullable: true })
  degas2InputQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  degas2GoodQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  degas2DefectQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  degas2DiscardQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  degas2DefectRate: number;

  // 셀 프레스
  @Column({ type: 'smallint', nullable: true })
  cellPressInputQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  cellPressGoodQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  cellPressDefectQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  cellPressDiscardQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cellPressDefectRate: number;

  // 파이널 실링
  @Column({ type: 'smallint', nullable: true })
  finalSealingInputQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  finalSealingGoodQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  finalSealingDefectQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  finalSealingDiscardQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  finalSealingDefectRate: number;

  // 실링 두께 1~5
  @Column({ type: 'smallint', nullable: true })
  sealingThickness1: number;

  @Column({ type: 'smallint', nullable: true })
  sealingThickness2: number;

  @Column({ type: 'smallint', nullable: true })
  sealingThickness3: number;

  @Column({ type: 'smallint', nullable: true })
  sealingThickness4: number;

  @Column({ type: 'smallint', nullable: true })
  sealingThickness5: number;

  // lot 마킹
  @Column({ type: 'smallint', nullable: true })
  lotMarkingInputQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  lotMarkingGoodQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  lotMarkingDefectQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  lotMarkingDiscardQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  lotMarkingDefectRate: number;

  // 메인포메이션
  @Column({ type: 'smallint', nullable: true })
  mainFormationInputQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  mainFormationGoodQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  mainFormationDefectQuantity: number;

  @Column({ type: 'smallint', nullable: true })
  mainFormationDiscardQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  mainFormationDefectRate: number;

  // 메인포메이션 호기 1
  @Column({ type: 'varchar', length: 20, nullable: true })
  mainFormation1UnitNumber: string;

  @Column({ type: 'smallint', nullable: true })
  mainFormation1Quantity: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  mainFormation1CellNumberRange: string;

  // 메인포메이션 호기 2
  @Column({ type: 'varchar', length: 20, nullable: true })
  mainFormation2UnitNumber: string;

  @Column({ type: 'smallint', nullable: true })
  mainFormation2Quantity: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  mainFormation2CellNumberRange: string;

  // 메인포메이션 호기 3
  @Column({ type: 'varchar', length: 20, nullable: true })
  mainFormation3UnitNumber: string;

  @Column({ type: 'smallint', nullable: true })
  mainFormation3Quantity: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  mainFormation3CellNumberRange: string;

  // 메인포메이션 호기 4
  @Column({ type: 'varchar', length: 20, nullable: true })
  mainFormation4UnitNumber: string;

  @Column({ type: 'smallint', nullable: true })
  mainFormation4Quantity: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  mainFormation4CellNumberRange: string;

  // 메인포메이션 호기 5
  @Column({ type: 'varchar', length: 20, nullable: true })
  mainFormation5UnitNumber: string;

  @Column({ type: 'smallint', nullable: true })
  mainFormation5Quantity: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  mainFormation5CellNumberRange: string;

  // OCV1
  @Column({ type: 'smallint', nullable: true })
  ocv1Quantity: number;

  // Lot
  @Column({ type: 'varchar', length: 50, nullable: true })
  lotRange: string;

  // ===== C. 공정 조건 (Process Conditions) =====

  // 프리포메이션
  @Column({ type: 'varchar', length: 50, nullable: true })
  preFormationVoltageCondition: string;

  @Column({ type: 'smallint', nullable: true })
  preFormationLowerVoltage: number;

  @Column({ type: 'smallint', nullable: true })
  preFormationUpperVoltage: number;

  @Column({ type: 'smallint', nullable: true })
  preFormationAppliedCurrent: number;

  @Column({ type: 'smallint', nullable: true })
  preFormationTemperature: number;

  // 메인포메이션
  @Column({ type: 'varchar', length: 50, nullable: true })
  mainFormationVoltageCondition: string;

  @Column({ type: 'smallint', nullable: true })
  mainFormationLowerVoltage: number;

  @Column({ type: 'smallint', nullable: true })
  mainFormationUpperVoltage: number;

  @Column({ type: 'smallint', nullable: true })
  mainFormationAppliedCurrent: number;

  @Column({ type: 'smallint', nullable: true })
  mainFormationTemperature: number;

  // 디가스
  @Column({ type: 'smallint', nullable: true })
  degasVacuumHoldTime: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  degasVacuumSealingAdhesionTime: string;

  @Column({ type: 'smallint', nullable: true })
  degasVacuumDegree: number;

  // OCV1
  @Column({ type: 'varchar', length: 100, nullable: true })
  ocv1MeasurementEquipmentName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ocv1VoltageSpec: string;
}