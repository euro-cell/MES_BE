import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Material } from './material.entity';
import { MaterialHistoryType, MaterialProcess } from '../enums/material.enum';

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

  @Column({ type: 'int' })
  previousStock: number;

  @Column({ type: 'int' })
  currentStock: number;

  @Column({ length: 100, nullable: true })
  reason: string;

  @CreateDateColumn()
  createdAt: Date;
}
