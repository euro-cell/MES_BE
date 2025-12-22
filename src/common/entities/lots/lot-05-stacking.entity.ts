import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { LotBase } from './lot-00-base.entity';
import { WorklogStacking } from '../worklogs/worklog-09-stacking.entity';

@Entity('lot_stackings')
export class LotStacking extends LotBase {
  @Column({ type: 'varchar', length: 50, nullable: true })
  jrRange: string;

  @Column({ type: 'boolean', default: false })
  isDefective: boolean;

  @ManyToOne(() => WorklogStacking, { nullable: true })
  @JoinColumn()
  worklogStacking: WorklogStacking;
}
