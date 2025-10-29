import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { MaterialOrigin, MaterialProcess, MaterialPurpose } from '../enums/material.enum';
import { Exclude } from 'class-transformer';

@Entity('materials')
export class Material {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: MaterialProcess })
  process: MaterialProcess;

  @Column({ length: 50 })
  category: string;

  @Column({ length: 100 })
  type: string;

  @Column({ type: 'enum', enum: MaterialPurpose })
  purpose: MaterialPurpose;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50, nullable: true })
  lotNo: string;

  @Column({ length: 100, nullable: true })
  company: string;

  @Column({ type: 'enum', enum: MaterialOrigin })
  origin: MaterialOrigin;

  @Column({ length: 20 })
  unit: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  price: number;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ type: 'int', default: 0, nullable: true })
  stock: number;

  @Exclude()
  @CreateDateColumn()
  createdAt: Date;

  @Exclude()
  @UpdateDateColumn()
  updatedAt: Date;
}
