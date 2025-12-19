import { Entity, ManyToOne, JoinColumn } from 'typeorm';
import { LotBase } from './lot-00-base.entity';
import { WorklogCoating } from '../worklogs/worklog-03-coating.entity';
import { WorklogSlurry } from '../worklogs/worklog-02-slurry.entity';

@Entity('lot_coatings')
export class LotCoating extends LotBase {
  @ManyToOne(() => WorklogSlurry, { nullable: true })
  @JoinColumn()
  worklogSlurry: WorklogSlurry;

  @ManyToOne(() => WorklogCoating, { nullable: true })
  @JoinColumn()
  worklogCoating: WorklogCoating;
}
