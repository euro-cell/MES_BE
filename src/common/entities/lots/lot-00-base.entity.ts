import { PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Production } from '../production.entity';

export abstract class LotBase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  lot: string;

  @ManyToOne(() => Production, { onDelete: 'CASCADE' })
  @JoinColumn()
  production: Production;

  @Column({ type: 'date', nullable: true })
  processDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
