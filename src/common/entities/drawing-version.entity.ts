import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Drawing } from './drawing.entity';

@Entity('drawing_versions')
export class DrawingVersion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  drawingId: number;

  @ManyToOne(() => Drawing, (drawing) => drawing.versions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'drawing_id' })
  drawing: Drawing;

  @Column({ length: 20 })
  version: string;

  @Column({ length: 500 })
  drawingFilePath: string;

  @Column({ length: 255 })
  drawingFileName: string;

  @Column({ length: 500, nullable: true })
  pdfFilePath: string;

  @Column({ length: 255, nullable: true })
  pdfFileName: string;

  @Column({ type: 'date' })
  registrationDate: Date;

  @Column({ type: 'text', nullable: true })
  changeNote: string;

  @Exclude()
  @CreateDateColumn()
  createdAt: Date;

  @Exclude()
  @UpdateDateColumn()
  updatedAt: Date;
}
