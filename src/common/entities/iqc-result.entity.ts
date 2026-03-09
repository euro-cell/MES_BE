import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IQC } from './iqc.entity';

@Entity('iqc_result')
export class IQCResult {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ManyToOne(() => IQC, (iqc) => iqc.results, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'iqc_id' })
  iqc: IQC;

  @Column({ type: 'varchar', length: 50 })
  category: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  item: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  unit: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  spec: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  refCoa: string | null;

  @Column({ type: 'float', nullable: true })
  refLastData: number | null;

  @Column({ type: 'float', nullable: true })
  sample1: number | null;

  @Column({ type: 'float', nullable: true })
  sample2: number | null;

  @Column({ type: 'float', nullable: true })
  sample3: number | null;

  @Column({ type: 'float', nullable: true })
  average: number | null;

  @Column({ type: 'boolean' })
  isPassed: boolean;

  @Column({ type: 'varchar', length: 200, nullable: true })
  note: string | null;

  @BeforeInsert()
  @BeforeUpdate()
  calculateAverage() {
    const samples = [this.sample1, this.sample2, this.sample3].filter(
      (v) => v !== null && v !== undefined,
    ) as number[];
    this.average = samples.length > 0
      ? samples.reduce((sum, v) => sum + v, 0) / samples.length
      : null;
  }
}
