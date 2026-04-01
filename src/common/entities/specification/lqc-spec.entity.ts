import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { LqcProcessType, LqcItemType } from '../../enums/lqc.enum';
import { Project } from '../project/project.entity';

export interface SpecValue {
  target?: number;
  tolerance?: number;
  min?: number;
  max?: number;
  unit: string;
}

export type LqcSpecs = Record<string, SpecValue>;

@Entity('lqc_spec')
@Unique('uk_lqc_spec', ['project', 'processType', 'itemType'])
export class LqcSpec {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ type: 'varchar', length: 50, enum: LqcProcessType })
  processType: LqcProcessType;

  @Column({ type: 'varchar', length: 50, enum: LqcItemType })
  itemType: LqcItemType;

  @Column({ type: 'json' })
  specs: LqcSpecs;
}
