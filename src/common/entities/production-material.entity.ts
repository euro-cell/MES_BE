import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MaterialCategory, MaterialClassification } from '../enums/material.enum';
import { Production } from './production.entity';

@Entity('production_materials')
export class ProductionMaterial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: MaterialClassification })
  classification: MaterialClassification;

  @Column({ type: 'enum', enum: MaterialCategory })
  category: MaterialCategory;

  @Column()
  material: string;

  @Column()
  model: string;

  @Column()
  company: string;

  @Column()
  requiredAmount: number;

  @Column()
  unit: string;

  @ManyToOne(() => Production, (production) => production.productionMaterials, { onDelete: 'CASCADE' })
  production: Production;
}
