import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ProcessTemplateItem } from './process-template-item.entity';

@Entity('process_templates')
export class ProcessTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50 })
  formFactor: string;

  @OneToMany(() => ProcessTemplateItem, (item) => item.template, { cascade: true })
  items: ProcessTemplateItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
