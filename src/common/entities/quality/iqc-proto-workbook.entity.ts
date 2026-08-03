import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('iqc_proto_workbook')
export class IqcProtoWorkbook {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 500 })
  workbookDataPath: string;

  @Column({ type: 'varchar', length: 255 })
  fileName: string;

  @CreateDateColumn()
  uploadedAt: Date;
}
