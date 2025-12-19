import { Entity, ManyToOne, JoinColumn } from 'typeorm';
import { LotBase } from './lot-00-base.entity';
import { WorklogPress } from '../worklogs/worklog-04-press.entity';
import { LotCoating } from './lot-02-coating.entity';

@Entity('lot_presses')
export class LotPress extends LotBase {
  @ManyToOne(() => LotCoating, { nullable: true })
  @JoinColumn()
  lotCoating: LotCoating;

  @ManyToOne(() => WorklogPress, { nullable: true })
  @JoinColumn()
  worklogPress: WorklogPress;
}
