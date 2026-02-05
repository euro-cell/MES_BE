import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IQCCathodeMaterial1 } from './iqc-cathode-material-1.entity';

@Entity('iqc_cathode_material_1_image')
export class IQCCathodeMaterial1Image {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ManyToOne(() => IQCCathodeMaterial1, (material) => material.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cathode_material_1_id' })
  cathodeMaterial1: IQCCathodeMaterial1;

  @Column({ type: 'varchar', length: 500 })
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;
}
