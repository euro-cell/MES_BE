import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Production } from './production.entity';

@Entity('production_plans')
export class ProductionPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Production, (production) => production.plan, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'production_id' })
  production: Production;

  @Column({ type: 'date', nullable: true })
  startDate: string;
  @Column({ type: 'date', nullable: true })
  endDate: string;

  @Column({ nullable: true })
  mixingCathode: string;
  @Column({ nullable: true })
  mixingAnode: string;
  @Column({ nullable: true })
  coatingCathode: string;
  @Column({ nullable: true })
  coatingAnode: string;
  @Column({ nullable: true })
  calenderingCathode: string;
  @Column({ nullable: true })
  calenderingAnode: string;
  @Column({ nullable: true })
  notchingCathode: string;
  @Column({ nullable: true })
  notchingAnode: string;

  @Column({ nullable: true })
  pouchForming: string;
  @Column({ nullable: true })
  vacuumDryingCathode: string;
  @Column({ nullable: true })
  vacuumDryingAnode: string;
  @Column({ nullable: true })
  stacking: string;
  @Column({ nullable: true })
  tabWelding: string;
  @Column({ nullable: true })
  sealing: string;
  @Column({ nullable: true })
  elFilling: string;
  @Column({ nullable: true })
  pfMf: string;
  @Column({ nullable: true })
  grading: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
