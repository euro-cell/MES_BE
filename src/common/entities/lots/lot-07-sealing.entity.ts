import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { LotBase } from './lot-00-base.entity';
import { WorklogSealing } from '../worklogs/worklog-11-sealing.entity';
import { WorklogFilling } from '../worklogs/worklog-12-filling.entity';

@Entity('lot_sealings')
export class LotSealing extends LotBase {
  @Column({ type: 'varchar', length: 50, nullable: true })
  weldingLot: string;

  @Column({ type: 'boolean', default: false })
  isDefectiveFromStacking: boolean;

  @Column({ type: 'boolean', default: false })
  isDefectiveFromWelding: boolean;

  @Column({ type: 'boolean', default: false })
  isDefectiveFromSealing: boolean;

  @Column({ type: 'date', nullable: true })
  fillingDate: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  electrolyteLot: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  pouchLot: string;

  @ManyToOne(() => WorklogSealing, { nullable: true })
  @JoinColumn()
  worklogSealing: WorklogSealing;

  @ManyToOne(() => WorklogFilling, { nullable: true })
  @JoinColumn()
  worklogFilling: WorklogFilling;
}
