import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Project } from './project.entity';
import { IQCResult } from './iqc-result.entity';
import { IQCCoaRef } from './iqc-coa-ref.entity';
import { IQCImage } from './iqc-image.entity';
import { IQCFile } from './iqc-file.entity';

@Entity('iqc')
export class IQC {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ type: 'varchar', length: 50 })
  category: string;

  @Column({ type: 'varchar', length: 50 })
  type: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  manufacturer: string | null;

  @Column({ type: 'varchar', length: 100 })
  lotNo: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  usage: string | null;

  @Column({ type: 'date', nullable: true })
  receiptDate: Date | null;

  @Column({ type: 'date', nullable: true })
  inspectionDate: Date | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  inspector: string | null;

  @Column({ type: 'boolean', default: true })
  isPassed: boolean;

  @Column({ type: 'text', nullable: true })
  remark: string | null;

  @Column({ type: 'json', nullable: true })
  psdData: { size: number; volumeIn: number }[] | null;

  @OneToMany(() => IQCResult, (result) => result.iqc, { cascade: true })
  results: IQCResult[];

  @OneToMany(() => IQCCoaRef, (coaRef) => coaRef.iqc, { cascade: true })
  coaRefs: IQCCoaRef[];

  @OneToMany(() => IQCImage, (image) => image.iqc, { cascade: true })
  images: IQCImage[];

  @OneToMany(() => IQCFile, (file) => file.iqc, { cascade: true })
  files: IQCFile[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
