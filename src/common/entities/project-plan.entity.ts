import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Project } from './project.entity';

@Entity('project_plans')
export class ProjectPlan {
  @PrimaryGeneratedColumn()
  id: number;

  // ✅ 1:1 관계
  @OneToOne(() => Project, (project) => project.plan, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  // ✅ 프로젝트 전체 일정
  @Column({ type: 'date', nullable: true })
  startDate: string;

  @Column({ type: 'date', nullable: true })
  endDate: string;

  // ✅ 공정별 일정
  @Column({ nullable: true }) mixing_cathode: string;
  @Column({ nullable: true }) mixing_anode: string;
  @Column({ nullable: true }) coating_cathode: string;
  @Column({ nullable: true }) coating_anode: string;
  @Column({ nullable: true }) calendering_cathode: string;
  @Column({ nullable: true }) calendering_anode: string;
  @Column({ nullable: true }) notching_cathode: string;
  @Column({ nullable: true }) notching_anode: string;

  @Column({ nullable: true }) pouch_forming: string;
  @Column({ nullable: true }) vacuum_drying_cathode: string;
  @Column({ nullable: true }) vacuum_drying_anode: string;
  @Column({ nullable: true }) stacking: string;
  @Column({ nullable: true }) tab_welding: string;
  @Column({ nullable: true }) sealing: string;
  @Column({ nullable: true }) el_filling: string;
  @Column({ nullable: true }) pf_mf: string;
  @Column({ nullable: true }) grading: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
