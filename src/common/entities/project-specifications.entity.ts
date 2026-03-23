import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Project } from './project.entity';

@Entity('project_specifications')
export class ProjectSpecification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'jsonb', nullable: true })
  cathode: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  anode: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  assembly: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  cell: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date | null;

  @OneToOne(() => Project, (project) => project.projectSpecifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;
}
