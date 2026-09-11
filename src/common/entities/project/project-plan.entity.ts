import { Entity, PrimaryGeneratedColumn, Column, OneToOne, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Project } from './project.entity';
import { ProcessTemplate } from './process-template.entity';
import { ProjectPlanItem } from './project-plan-item.entity';

@Entity('project_plans')
export class ProjectPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Project, (project) => project.plan, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => ProcessTemplate, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'template_id' })
  template: ProcessTemplate | null;

  @Column({ type: 'date', nullable: true })
  startDate: string;
  @Column({ type: 'date', nullable: true })
  endDate: string;

  @OneToMany(() => ProjectPlanItem, (item) => item.plan, { cascade: true })
  items: ProjectPlanItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
