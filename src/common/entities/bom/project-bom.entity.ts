import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Project } from '../project/project.entity';
import { BomTemplate } from './bom-template.entity';

@Entity('project_boms')
export class ProjectBom {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => BomTemplate, (template) => template.projectBoms, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'bom_template_id' })
  bomTemplate: BomTemplate;
}
