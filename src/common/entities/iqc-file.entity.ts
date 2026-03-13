import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IQC } from './iqc.entity';

@Entity('iqc_file')
export class IQCFile {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ManyToOne(() => IQC, (iqc) => iqc.files, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'iqc_id' })
  iqc: IQC;

  @Column({ type: 'varchar', length: 50 })
  fileType: string;

  @Column({ type: 'varchar', length: 255 })
  fileName: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  filePath: string | null;

  @CreateDateColumn()
  uploadedAt: Date;
}
