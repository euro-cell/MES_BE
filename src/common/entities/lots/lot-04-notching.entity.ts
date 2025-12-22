import { Entity, ManyToOne, JoinColumn } from 'typeorm';
import { LotBase } from './lot-00-base.entity';
import { WorklogNotching } from '../worklogs/worklog-06-notching.entity';
import { LotPress } from './lot-03-press.entity';

@Entity('lot_notchings')
export class LotNotching extends LotBase {
  @ManyToOne(() => LotPress, { nullable: true })
  @JoinColumn()
  lotPress: LotPress;

  @ManyToOne(() => WorklogNotching, { nullable: true })
  @JoinColumn()
  worklogNotching: WorklogNotching;
}
