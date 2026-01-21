import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { DrawingCategory } from '../enums/drawing.enum';
import { DrawingVersion } from './drawing-version.entity';

@Entity('drawings')
export class Drawing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: DrawingCategory })
  category: DrawingCategory;

  @Column({ length: 200 })
  projectName: string;

  @Column({ length: 100, unique: true })
  drawingNumber: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 20, default: '1' })
  currentVersion: string;

  @OneToMany(() => DrawingVersion, (version) => version.drawing)
  versions: DrawingVersion[];

  @Exclude()
  @CreateDateColumn()
  createdAt: Date;

  @Exclude()
  @UpdateDateColumn()
  updatedAt: Date;

  @Exclude()
  @DeleteDateColumn()
  deletedAt?: Date;
}
