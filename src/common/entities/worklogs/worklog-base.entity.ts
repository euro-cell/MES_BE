import { PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Production } from '../production.entity';

export abstract class WorklogBase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  manufacture_date: Date;

  @Column({ type: 'bigint' })
  production_id: string;

  @ManyToOne(() => Production, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'production_id' })
  production: Production;

  @Column({ type: 'varchar', length: 50 })
  worker: string;

  @Column({ type: 'varchar', length: 50 })
  line: string;

  @Column({ type: 'varchar', length: 100 })
  plant: string;

  @Column({ type: 'varchar', length: 20 })
  shift: string;

  @Column({ type: 'boolean', default: false })
  equipment_check_result: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  jig_number: string;

  @Column({ type: 'boolean', default: false })
  equipment_issue: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  temp_humi: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  clean_check: string;

  @Column({ type: 'boolean', default: false })
  safety: boolean;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  writer: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  reviewer: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  approver: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  created_by: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  updated_by: string;
}
