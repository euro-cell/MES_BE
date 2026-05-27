import { Column, CreateDateColumn, UpdateDateColumn, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Material } from './material.entity';
import { MaterialHistoryType, MaterialProcess } from '../../enums/material.enum';

@Entity('material_histories')
export class MaterialHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  materialId: number;

  @ManyToOne(() => Material)
  @JoinColumn({ name: 'material_id' })
  material: Material;

  @Column({ type: 'enum', enum: MaterialProcess })
  process: MaterialProcess;

  @Column({ type: 'enum', enum: MaterialHistoryType })
  type: MaterialHistoryType;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  previousStock: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  currentStock: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
