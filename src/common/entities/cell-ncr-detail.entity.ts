import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ForeignKey,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CellNcr } from './cell-ncr.entity';

@Entity('cell_ncr_details')
export class CellNcrDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cellNcrId: number;

  @Column({ type: 'varchar', length: 100 })
  projectName: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'varchar', length: 255 })
  details: string;

  @Column({ type: 'varchar', length: 255 })
  type: string;

  @Column({ type: 'int', default: 0 })
  count: number;

  @ManyToOne(() => CellNcr, (cellNcr) => cellNcr.cellNcrDetails, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cellNcrId' })
  cellNcr: CellNcr;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
