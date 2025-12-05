import { Entity, Column } from 'typeorm';
import { WorklogBase } from './worklog-base.entity';

@Entity('worklog_binders')
export class WorklogBinder extends WorklogBase {
  @Column({ type: 'varchar', length: 50, nullable: true })
  material_1_name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  material_1_composition: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  material_1_lot: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  material_1_planned_input: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  material_1_actual_input: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  material_2_name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  material_2_composition: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  material_2_lot: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  material_2_planned_input: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  material_2_actual_input: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  binder_solution: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lot: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  viscosity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  solid_content_1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  solid_content_2: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  solid_content_3: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  nmp_weight_input: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  nmp_weight_temp: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  nmp_weight_rpm_low: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  nmp_weight_rpm_high: number;

  @Column({ type: 'time', nullable: true })
  nmp_weight_start_time: string;

  @Column({ type: 'time', nullable: true })
  nmp_weight_end_time: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  binder_weight_input: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  binder_weight_temp: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  binder_weight_rpm_low: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  binder_weight_rpm_high: number;

  @Column({ type: 'time', nullable: true })
  binder_weight_start_time: string;

  @Column({ type: 'time', nullable: true })
  binder_weight_end_time: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  mixing_1_input: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  mixing_1_temp: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  mixing_1_rpm_low: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  mixing_1_rpm_high: number;

  @Column({ type: 'time', nullable: true })
  mixing_1_start_time: string;

  @Column({ type: 'time', nullable: true })
  mixing_1_end_time: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  scrapping_input: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  scrapping_temp: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  scrapping_rpm_low: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  scrapping_rpm_high: number;

  @Column({ type: 'time', nullable: true })
  scrapping_start_time: string;

  @Column({ type: 'time', nullable: true })
  scrapping_end_time: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  mixing_2_input: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  mixing_2_temp: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  mixing_2_rpm_low: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  mixing_2_rpm_high: number;

  @Column({ type: 'time', nullable: true })
  mixing_2_start_time: string;

  @Column({ type: 'time', nullable: true })
  mixing_2_end_time: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  stabilization_input: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  stabilization_temp: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  stabilization_rpm_low: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  stabilization_rpm_high: number;

  @Column({ type: 'time', nullable: true })
  stabilization_start_time: string;

  @Column({ type: 'time', nullable: true })
  stabilization_end_time: string;
}
