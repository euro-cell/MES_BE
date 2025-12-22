import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { LotBase } from './lot-00-base.entity';
import { WorklogWelding } from '../worklogs/worklog-10-welding.entity';

@Entity('lot_weldings')
export class LotWelding extends LotBase {
  @Column({ type: 'varchar', length: 50, nullable: true })
  stackingLot: string;

  @Column({ type: 'boolean', default: false })
  isDefectiveFromStacking: boolean;

  @Column({ type: 'boolean', default: false })
  isDefectiveFromWelding: boolean;

  @ManyToOne(() => WorklogWelding, { nullable: true })
  @JoinColumn()
  worklogWelding: WorklogWelding;
}
