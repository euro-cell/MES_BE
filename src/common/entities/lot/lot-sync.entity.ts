import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from '../project/project.entity';

@Entity('lot_syncs')
export class LotSync {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn()
  project: Project;

  @Column({ type: 'varchar', length: 50 })
  process: string;

  @Column({ type: 'timestamp' })
  syncedAt: Date;
}
