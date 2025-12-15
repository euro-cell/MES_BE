import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToOne, OneToMany } from 'typeorm';
import { ProductionPlan } from './production-plan.entity';
import { ProductionTarget } from './production-target.entity';
import { Specification } from './specification.entity';
import { ProductionMaterial } from './production-material.entity';
import { ProductionSpecification } from './production-specifications.entity';

@Entity('productions')
export class Production {
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

  @OneToOne(() => ProductionPlan, (plan) => plan.production)
  plan: ProductionPlan;

  @OneToOne(() => ProductionTarget, (target) => target.production)
  target: ProductionTarget;

  @OneToOne(() => Specification, (specification) => specification.production)
  specification: Specification;

  @OneToOne(() => ProductionSpecification, (productionSpecification) => productionSpecification.production)
  productionSpecifications: ProductionSpecification;

  @OneToMany(() => ProductionMaterial, (prodMaterial: ProductionMaterial) => prodMaterial.production)
  productionMaterials: ProductionMaterial[];
}
