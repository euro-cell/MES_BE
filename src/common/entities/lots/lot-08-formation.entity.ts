import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { LotBase } from './lot-00-base.entity';
import { LotSealing } from './lot-07-sealing.entity';
import { WorklogFormation } from '../worklogs/worklog-13-formation.entity';
import { WorklogGrading } from '../worklogs/worklog-14-grading.entity';

@Entity('lot_formations')
export class LotFormation extends LotBase {
  // ===== 이전 공정 연결 (assyLot) =====
  @ManyToOne(() => LotSealing, { nullable: true })
  @JoinColumn()
  lotSealing: LotSealing;

  // ===== 작업일지 연결 =====
  @ManyToOne(() => WorklogFormation, { nullable: true })
  @JoinColumn()
  worklogFormation: WorklogFormation;

  @ManyToOne(() => WorklogGrading, { nullable: true })
  @JoinColumn()
  worklogGrading: WorklogGrading;

  // ===== Pre-Formation =====
  @Column({ type: 'varchar', length: 50, nullable: true })
  preFormationEquipment: string;

  @Column({ type: 'smallint', nullable: true })
  preFormationChNo: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  pfc: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  rfd: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  forEff1: number;

  // ===== Final Sealing =====
  @Column({ type: 'boolean', default: false })
  isDefectiveFromFinalSealing: boolean;

  @Column({ type: 'smallint', nullable: true })
  finalPouchSealingThickness: number;

  // true = pass (양품), false = not pass (불량)
  @Column({ type: 'boolean', nullable: true })
  finalSideBottomSealingWidth: boolean;

  // true = pass (양품), false = not pass (불량)
  @Column({ type: 'boolean', nullable: true })
  finalVisualInspection: boolean;

  // ===== Main Formation =====
  @Column({ type: 'varchar', length: 50, nullable: true })
  mainFormationEquipment: string;

  @Column({ type: 'smallint', nullable: true })
  mainFormationChNo: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  mfc: number;

  // ===== OCV/IR 1 =====
  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  ocv1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  ir1: number;

  // ===== Aging 4 Days =====
  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  ocv2_4: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  ir2_4: number;

  // ===== Aging 7 Days =====
  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  ocv2_7: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  ir2_7: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  deltaV: number;

  // ===== Grading =====
  @Column({ type: 'varchar', length: 50, nullable: true })
  gradingEquipment: string;

  @Column({ type: 'smallint', nullable: true })
  gradingChNo: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  mfd: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  formEff2: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  stc: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  std: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  formEff3: number;

  @Column({ type: 'smallint', nullable: true })
  gradingTemp: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  wh: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  nominalV: number;

  // ===== SOC =====
  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  socCapacity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  soc: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  dcIr: number;

  // ===== OCV/IR 3 =====
  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  ocv3: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  ir3: number;
}
