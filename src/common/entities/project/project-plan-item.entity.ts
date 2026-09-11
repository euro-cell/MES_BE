import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ProjectPlan } from './project-plan.entity';

@Entity('project_plan_items')
export class ProjectPlanItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ProjectPlan, (plan) => plan.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_id' })
  plan: ProjectPlan;

  @Column({ length: 200 })
  key: string;

  @Column({ type: 'date', nullable: true })
  startDate: string;

  @Column({ type: 'date', nullable: true })
  endDate: string;
}
