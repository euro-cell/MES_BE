import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { LqcProcessType, LqcItemType } from '../enums/lqc.enum';
import { Production } from './production.entity';

export interface SpecValue {
  target?: number;
  tolerance?: number;
  min?: number;
  max?: number;
  unit: string;
}

export type LqcSpecs = Record<string, SpecValue>;

@Entity('lqc_spec')
@Unique('uk_lqc_spec', ['production', 'processType', 'itemType'])
export class LqcSpec {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ManyToOne(() => Production)
  @JoinColumn({ name: 'production_id' })
  production: Production;

  @Column({ type: 'varchar', length: 50, enum: LqcProcessType })
  processType: LqcProcessType;

  @Column({ type: 'varchar', length: 50, enum: LqcItemType })
  itemType: LqcItemType;

  @Column({ type: 'json' })
  specs: LqcSpecs;
}
