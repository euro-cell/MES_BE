import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IQC } from './iqc.entity';

@Entity('iqc_image')
export class IQCImage {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ManyToOne(() => IQC, (iqc) => iqc.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'iqc_id' })
  iqc: IQC;

  @Column({ type: 'varchar', length: 50 })
  imageType: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  imageLabel: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  filePath: string | null;

  @CreateDateColumn()
  uploadedAt: Date;
}
