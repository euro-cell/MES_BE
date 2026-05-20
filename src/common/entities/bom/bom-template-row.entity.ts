import { Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BomTemplate } from './bom-template.entity';
import { Material } from '../material/material.entity';

export enum BomClassification {
  CATHODE = 'Cathode',
  ANODE = 'Anode',
  ASSY = "Ass'y",
}

export enum BomCurrency {
  KRW = 'KRW',
  USD = 'USD',
  JPY = 'JPY',
  EUR = 'EUR',
}

@Entity('bom_template_rows')
export class BomTemplateRow {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: BomClassification })
  classification: BomClassification;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  yieldRate: number;

  @Column({ type: 'enum', enum: BomCurrency })
  currency: BomCurrency;

  @Column({ type: 'decimal', precision: 14, scale: 4, nullable: true })
  purchasePrice: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  tariff: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  etc: number;

  @Column({ type: 'decimal', precision: 14, scale: 6 })
  netQty: number;

  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToOne(() => BomTemplate, (template) => template.rows, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bom_template_id' })
  bomTemplate: BomTemplate;

  @ManyToOne(() => Material, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'material_id' })
  material: Material;
}
