import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Project } from '../project/project.entity';

@Entity('iqc_summary')
export class IQCSummary {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @OneToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ type: 'varchar', length: 100, nullable: true })
  modelName: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  version: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lotNo: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  usage: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  manager: string | null;

  @Column({ type: 'text', nullable: true })
  specialNotes: string | null;

  @Column({ type: 'text', nullable: true })
  remark: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
