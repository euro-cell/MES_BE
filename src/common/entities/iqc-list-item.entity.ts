import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Production } from './production.entity';

@Entity('iqc_list_item')
export class IQCListItem {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ManyToOne(() => Production)
  @JoinColumn({ name: 'production_id' })
  production: Production;

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ type: 'text', nullable: true })
  standard: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  result: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  inspector: string | null;

  @Column({ type: 'date', nullable: true })
  inspectionDate: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
