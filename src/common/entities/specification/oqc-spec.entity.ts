import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { OqcProcessType, OqcItemType } from '../../enums/oqc.enum';
import { Project } from '../project/project.entity';

export interface SpecValue {
  target?: number;
  tolerance?: number;
  min?: number;
  max?: number;
  unit: string;
}

export type OqcSpecs = Record<string, SpecValue>;

@Entity('oqc_spec')
@Unique('uk_oqc_spec', ['project', 'processType', 'itemType'])
export class OqcSpec {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ type: 'varchar', length: 50, enum: OqcProcessType })
  processType: OqcProcessType;

  @Column({ type: 'varchar', length: 50, enum: OqcItemType })
  itemType: OqcItemType;

  @Column({ type: 'json' })
  specs: OqcSpecs;
}
