import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { OqcProcessType, OqcItemType } from '../enums/oqc.enum';
import { Production } from './production.entity';

export interface SpecValue {
  target?: number;
  tolerance?: number;
  min?: number;
  max?: number;
  unit: string;
}

export type OqcSpecs = Record<string, SpecValue>;

@Entity('oqc_spec')
@Unique('uk_oqc_spec', ['production', 'processType', 'itemType'])
export class OqcSpec {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ManyToOne(() => Production)
  @JoinColumn({ name: 'production_id' })
  production: Production;

  @Column({ type: 'varchar', length: 50, enum: OqcProcessType })
  processType: OqcProcessType;

  @Column({ type: 'varchar', length: 50, enum: OqcItemType })
  itemType: OqcItemType;

  @Column({ type: 'json' })
  specs: OqcSpecs;
}
