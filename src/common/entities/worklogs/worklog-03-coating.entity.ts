import { Entity, Column } from 'typeorm';
import { WorklogBase } from './worklog-00-base.entity';

@Entity('worklog_coatings')
export class WorklogCoating extends WorklogBase {
  // 자재 투입 정보 - 구분, LOT, 제조사, Spec., 투입량, 사용량
  @Column({ type: 'varchar', length: 50, nullable: true })
  materialType: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  materialLot: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  manufacturer: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  spec: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  inputAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  usageAmount: number;

  // 자재 투입 정보 - 구분, LOT, 고형분, 점도, 투입량 설계, 투입량 실제
  @Column({ type: 'varchar', length: 50, nullable: true })
  materialType2: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  materialLot2: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  solidContent: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  viscosity: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  inputAmountDesign: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  inputAmountActual: number;

  // 생산 정보 1차
  @Column({ type: 'varchar', length: 100, nullable: true })
  coatingLot1: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  productionQuantity1: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  coatingSide1: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  monoPumpFront1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  monoPumpRear1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  coatingWidth1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  misalignment1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaFront1M: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaFront1C: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaFront1D: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaRear1M: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaRear1C: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaRear1D: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  thicknessFront1M: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  thicknessFront1C: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  thicknessFront1D: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  thicknessRear1M: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  thicknessRear1C: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  thicknessRear1D: number;

  // 생산 정보 2차
  @Column({ type: 'varchar', length: 100, nullable: true })
  coatingLot2: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  productionQuantity2: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  coatingSide2: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  monoPumpFront2: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  monoPumpRear2: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  coatingWidth2: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  misalignment2: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaFront2M: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaFront2C: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaFront2D: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaRear2M: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaRear2C: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaRear2D: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  thicknessFront2M: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  thicknessFront2C: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  thicknessFront2D: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  thicknessRear2M: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  thicknessRear2C: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  thicknessRear2D: number;

  // 생산 정보 3차
  @Column({ type: 'varchar', length: 100, nullable: true })
  coatingLot3: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  productionQuantity3: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  coatingSide3: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  monoPumpFront3: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  monoPumpRear3: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  coatingWidth3: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  misalignment3: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaFront3M: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaFront3C: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaFront3D: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaRear3M: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaRear3C: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaRear3D: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  thicknessFront3M: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  thicknessFront3C: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  thicknessFront3D: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  thicknessRear3M: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  thicknessRear3C: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  thicknessRear3D: number;

  // 생산 정보 4차
  @Column({ type: 'varchar', length: 100, nullable: true })
  coatingLot4: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  productionQuantity4: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  coatingSide4: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  monoPumpFront4: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  monoPumpRear4: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  coatingWidth4: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  misalignment4: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaFront4M: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaFront4C: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaFront4D: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaRear4M: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaRear4C: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightPerAreaRear4D: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  thicknessFront4M: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  thicknessFront4C: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  thicknessFront4D: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  thicknessRear4M: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  thicknessRear4C: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  thicknessRear4D: number;

  // 건조 조건
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  zone1TempUpper: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  zone1TempLower: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  zone2TempUpper: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  zone2TempLower: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  zone3Temp: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  zone4Temp: number;

  // 공급 풍량 - Zone 1-4
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  zone1SupplyAirflowUpper: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  zone1SupplyAirflowLower: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  zone2SupplyAirflowUpper: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  zone2SupplyAirflowLower: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  zone3SupplyAirflow: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  zone4SupplyAirflow: number;

  // 배기 풍량 - Zone 1&2, Zone 3&4
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  zone12ExhaustAirflow: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  zone34ExhaustAirflow: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  capsuleFilter: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  coatingSpeed: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  meshFilter: number;

  // 장력 (3가지)
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tensionUnT: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tensionOfT: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tensionReT: number;

  // 코팅 조건 (단면/양면)
  @Column({ type: 'varchar', length: 50, nullable: true })
  coatingConditionSingle: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  coatingConditionDouble: string;
}
