import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { BomTemplateRow } from './bom-template-row.entity';
import { ProjectBom } from './project-bom.entity';

@Entity('bom_templates')
export class BomTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  usdRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  jpyRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  eurRate: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @OneToMany(() => BomTemplateRow, (row) => row.bomTemplate, { cascade: true })
  rows: BomTemplateRow[];

  @OneToMany(() => ProjectBom, (projectBom) => projectBom.bomTemplate)
  projectBoms: ProjectBom[];
}
