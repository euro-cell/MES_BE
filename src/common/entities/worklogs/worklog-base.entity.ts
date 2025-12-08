import { PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Production } from '../production.entity';

export abstract class WorklogBase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  manufactureDate: Date;

  @Column({ type: 'bigint' })
  productionId: string;

  @ManyToOne(() => Production, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productionId' })
  production: Production;

  @Column({ type: 'varchar', length: 50 })
  worker: string;

  @Column({ type: 'varchar', length: 50 })
  line: string;

  @Column({ type: 'varchar', length: 100 })
  plant: string;

  @Column({ type: 'varchar', length: 20 })
  shift: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  equipmentCheckResult: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  jigNumber: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  equipmentIssue: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  tempHumi: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  cleanCheck: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  safety: string;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  writer: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  reviewer: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  approver: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  createdBy: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  updatedBy: string;
}
