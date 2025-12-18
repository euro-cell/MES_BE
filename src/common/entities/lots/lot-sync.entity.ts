import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Production } from '../production.entity';

@Entity('lot_syncs')
export class LotSync {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Production, { onDelete: 'CASCADE' })
  @JoinColumn()
  production: Production;

  @Column({ type: 'varchar', length: 50 })
  process: string;

  @Column({ type: 'timestamp' })
  syncedAt: Date;
}
