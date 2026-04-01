import { Entity, Column } from 'typeorm';
import { WorklogBase } from './worklog-00-base.entity';

@Entity('worklog_visual_inspections')
export class WorklogVisualInspection extends WorklogBase {
  // ===== A. 자재 투입 정보 (Material Input) =====

  @Column({ type: 'varchar', length: 50, nullable: true })
  cellNumberRange: string;

  @Column({ type: 'smallint', nullable: true })
  cellInputQuantity: number;

  // ===== B. 생산 정보 (Production Info) =====
  // 가스 발생
  @Column({ type: 'smallint', nullable: true })
  gasDiscardQuantity: number;

  @Column({ type: 'text', nullable: true })
  gasDefectRemark: string;

  // 이물질 외관
  @Column({ type: 'smallint', nullable: true })
  foreignMatterDiscardQuantity: number;

  @Column({ type: 'text', nullable: true })
  foreignMatterDefectRemark: string;

  // 긁힘
  @Column({ type: 'smallint', nullable: true })
  scratchDiscardQuantity: number;

  @Column({ type: 'text', nullable: true })
  scratchDefectRemark: string;

  // 찍힘
  @Column({ type: 'smallint', nullable: true })
  dentDiscardQuantity: number;

  @Column({ type: 'text', nullable: true })
  dentDefectRemark: string;

  // 누액 및 부식
  @Column({ type: 'smallint', nullable: true })
  leakCorrosionDiscardQuantity: number;

  @Column({ type: 'text', nullable: true })
  leakCorrosionDefectRemark: string;

  // 전지 크기
  @Column({ type: 'smallint', nullable: true })
  cellSizeDiscardQuantity: number;

  @Column({ type: 'text', nullable: true })
  cellSizeDefectRemark: string;
}
