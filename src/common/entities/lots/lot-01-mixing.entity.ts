import { Entity, ManyToOne, JoinColumn } from 'typeorm';
import { LotBase } from './lot-00-base.entity';
import { WorklogBinder } from '../worklogs/worklog-01-binder.entity';
import { WorklogSlurry } from '../worklogs/worklog-02-slurry.entity';

@Entity('lot_mixings')
export class LotMixing extends LotBase {
  @ManyToOne(() => WorklogBinder, { nullable: true })
  @JoinColumn()
  worklogBinder: WorklogBinder;

  @ManyToOne(() => WorklogSlurry, { nullable: true })
  @JoinColumn()
  worklogSlurry: WorklogSlurry;
}
