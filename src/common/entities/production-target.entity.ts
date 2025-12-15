import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Production } from './production.entity';

@Entity('production_targets')
export class ProductionTarget {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Production, (production) => production.target, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'production_id' })
  production: Production;

  // 전극 공정
  @Column({ type: 'int', nullable: true })
  mixingCathode: number;

  @Column({ type: 'int', nullable: true })
  mixingAnode: number;

  @Column({ type: 'int', nullable: true })
  coatingSingleCathode: number;

  @Column({ type: 'int', nullable: true })
  coatingSingleAnode: number;

  @Column({ type: 'int', nullable: true })
  coatingDoubleCathode: number;

  @Column({ type: 'int', nullable: true })
  coatingDoubleAnode: number;

  @Column({ type: 'int', nullable: true })
  pressCathode: number;

  @Column({ type: 'int', nullable: true })
  pressAnode: number;

  @Column({ type: 'int', nullable: true })
  slittingCathode: number;

  @Column({ type: 'int', nullable: true })
  slittingAnode: number;

  @Column({ type: 'int', nullable: true })
  notchingCathode: number;

  @Column({ type: 'int', nullable: true })
  notchingAnode: number;

  // 조립 공정
  @Column({ type: 'int', nullable: true })
  vdCathode: number;

  @Column({ type: 'int', nullable: true })
  vdAnode: number;

  @Column({ type: 'int', nullable: true })
  forming: number;

  @Column({ type: 'int', nullable: true })
  stack: number;

  @Column({ type: 'int', nullable: true })
  preWelding: number;

  @Column({ type: 'int', nullable: true })
  mainWelding: number;

  @Column({ type: 'int', nullable: true })
  sealing: number;

  @Column({ type: 'int', nullable: true })
  filling: number;

  // 화성 공정
  @Column({ type: 'int', nullable: true })
  preFormation: number;

  @Column({ type: 'int', nullable: true })
  degas: number;

  @Column({ type: 'int', nullable: true })
  mainFormation: number;

  @Column({ type: 'int', nullable: true })
  aging: number;

  @Column({ type: 'int', nullable: true })
  grading: number;

  @Column({ type: 'int', nullable: true })
  visualInspection: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
