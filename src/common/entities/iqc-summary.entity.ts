import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Production } from './production.entity';

@Entity('iqc_summary')
export class IQCSummary {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ManyToOne(() => Production)
  @JoinColumn({ name: 'production_id' })
  production: Production;

  @Column({ type: 'text', nullable: true })
  projectOverview: string | null;

  @Column({ type: 'int', nullable: true, default: 0 })
  nonConformityCathode: number;

  @Column({ type: 'int', nullable: true, default: 0 })
  nonConformityAnode: number;

  @Column({ type: 'int', nullable: true, default: 0 })
  nonConformityConductive: number;

  @Column({ type: 'int', nullable: true, default: 0 })
  nonConformityCollector: number;

  @Column({ type: 'int', nullable: true, default: 0 })
  nonConformitySeparator: number;

  @Column({ type: 'int', nullable: true, default: 0 })
  nonConformityElectrolyte: number;

  @Column({ type: 'int', nullable: true, default: 0 })
  nonConformityPouch: number;

  @Column({ type: 'int', nullable: true, default: 0 })
  nonConformityLeadTab: number;

  @Column({ type: 'text', nullable: true })
  remarks: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
