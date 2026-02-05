import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Production } from './production.entity';
import { IQCCathodeMaterial1Result } from './iqc-cathode-material-1-result.entity';
import { IQCCathodeMaterial1Image } from './iqc-cathode-material-1-image.entity';

@Entity('iqc_cathode_material_1')
export class IQCCathodeMaterial1 {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ManyToOne(() => Production)
  @JoinColumn({ name: 'production_id' })
  production: Production;

  @Column({ type: 'date', nullable: true })
  inspectionDate: Date | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lot: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  manufacturer: string | null;

  @Column({ type: 'text', nullable: true })
  coaReference: string | null;

  @Column({ type: 'text', nullable: true })
  remarks: string | null;

  @OneToMany(() => IQCCathodeMaterial1Result, (result) => result.cathodeMaterial1, {
    cascade: true,
  })
  results: IQCCathodeMaterial1Result[];

  @OneToMany(() => IQCCathodeMaterial1Image, (image) => image.cathodeMaterial1, {
    cascade: true,
  })
  images: IQCCathodeMaterial1Image[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
