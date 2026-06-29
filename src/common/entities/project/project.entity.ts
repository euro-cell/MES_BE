import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToOne, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { ProjectPlan } from './project-plan.entity';
import { ProjectTarget } from './project-target.entity';
import { Specification } from '../specification/specification.entity';
import { ProjectMaterial } from './project-material.entity';
import { ProjectSpecification } from './project-specifications.entity';
import { ProjectBom } from '../bom/project-bom.entity';
import { Customer } from '../shared/customer.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ length: 10 })
  company: string;

  @Column({ length: 3 })
  mode: string;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'int' })
  month: number;

  @Column({ type: 'int' })
  round: number;

  @Column({ length: 20 })
  batteryType: string;

  @Column({ type: 'int' })
  capacity: number;

  @Column({ type: 'int' })
  targetQuantity: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @OneToOne(() => ProjectPlan, (plan) => plan.project)
  plan: ProjectPlan;

  @OneToOne(() => ProjectTarget, (target) => target.project)
  target: ProjectTarget;

  @OneToOne(() => Specification, (specification) => specification.project)
  specification: Specification;

  @OneToOne(() => ProjectSpecification, (projectSpecification) => projectSpecification.project)
  projectSpecifications: ProjectSpecification;

  @OneToMany(() => ProjectMaterial, (projMaterial: ProjectMaterial) => projMaterial.project)
  projectMaterials: ProjectMaterial[];

  @OneToMany(() => ProjectBom, (projectBom) => projectBom.project)
  projectBoms: ProjectBom[];

  @ManyToOne(() => Customer, (customer) => customer.projects, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer | null;
}
