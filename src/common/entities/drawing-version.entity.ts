import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Drawing } from './drawing.entity';

@Entity('drawing_versions')
export class DrawingVersion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Drawing, (drawing) => drawing.versions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'drawing_id' })
  drawing: Drawing;

  @Column({ type: 'decimal', precision: 5, scale: 1 })
  version: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  drawingFilePath?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  drawingFileName?: string;

  @Column({ type: 'json', nullable: true })
  pdfFilePaths?: string[];

  @Column({ type: 'json', nullable: true })
  pdfFileNames?: string[];

  @Column({ type: 'json', nullable: true })
  imageFilePaths?: string[];

  @Column({ type: 'date' })
  registrationDate: Date;

  @Column({ type: 'text', nullable: true })
  changeNote?: string;

  @Exclude()
  @CreateDateColumn()
  createdAt: Date;

  @Exclude()
  @UpdateDateColumn()
  updatedAt: Date;
}
