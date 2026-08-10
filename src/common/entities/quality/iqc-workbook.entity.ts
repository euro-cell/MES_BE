import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { IQC } from './iqc.entity';

@Entity('iqc_workbook')
export class IqcWorkbook {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ManyToOne(() => IQC, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'iqc_id' })
  iqc: IQC;

  @Column({ name: 'iqc_id' })
  iqcId: number;

  @Column({ type: 'varchar', length: 500 })
  workbookDataPath: string;

  @Column({ type: 'varchar', length: 255 })
  fileName: string;

  @CreateDateColumn()
  uploadedAt: Date;
}
