import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MaterialCategory, MaterialClassification } from '../../enums/material.enum';
import { Project } from './project.entity';

@Entity('project_materials')
export class ProjectMaterial {
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

  @ManyToOne(() => Project, (project) => project.projectMaterials, { onDelete: 'CASCADE' })
  project: Project;
}
