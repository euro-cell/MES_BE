import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IQCCathodeMaterial1 } from './iqc-cathode-material-1.entity';

@Entity('iqc_cathode_material_1_result')
export class IQCCathodeMaterial1Result {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ManyToOne(() => IQCCathodeMaterial1, (material) => material.results, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cathode_material_1_id' })
  cathodeMaterial1: IQCCathodeMaterial1;

  @Column({ type: 'varchar', length: 100 })
  item: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  standard: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  result: string | null;

  @Column({ type: 'boolean', default: true })
  pass: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
