import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Project } from '../project/project.entity';

@Entity('iqc_proto2_workbook')
export class IqcProto2Workbook {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ name: 'project_id' })
  projectId: number;

  @Column({ type: 'varchar', length: 500 })
  workbookDataPath: string;

  @Column({ type: 'varchar', length: 255 })
  fileName: string;

  @CreateDateColumn()
  uploadedAt: Date;
}
