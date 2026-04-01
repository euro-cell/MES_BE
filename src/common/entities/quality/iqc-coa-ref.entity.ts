import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IQC } from './iqc.entity';

@Entity('iqc_coa_ref')
export class IQCCoaRef {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ManyToOne(() => IQC, (iqc) => iqc.coaRefs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'iqc_id' })
  iqc: IQC;

  @Column({ type: 'varchar', length: 100 })
  attrName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  attrValue: string | null;
}
