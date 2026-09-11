import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ProcessTemplate } from './process-template.entity';

@Entity('process_template_items')
export class ProcessTemplateItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ProcessTemplate, (template) => template.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'template_id' })
  template: ProcessTemplate;

  @Column({ length: 50 })
  group: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'simple-array', default: '' })
  types: string[];

  @Column({ type: 'int' })
  order: number;
}
