import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { EquipmentCategory, EquipmentGrade, EquipmentProcess } from '../enums/equipment.enum';

@Entity('equipments')
export class Equipment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: EquipmentCategory })
  category: EquipmentCategory;

  @Column({ type: 'enum', enum: EquipmentProcess, nullable: true })
  processType: EquipmentProcess;

  @Column({ length: 50, nullable: true })
  assetNo?: string;

  @Column({ length: 50 })
  equipmentNo: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100 })
  manufacturer: string;

  @Column({ type: 'date' })
  purchaseDate: Date;

  @Column({ type: 'enum', enum: EquipmentGrade, nullable: true })
  grade: EquipmentGrade;

  @Column({ length: 50, nullable: true })
  maintenanceMethod: string;

  @Column({ type: 'text', nullable: true })
  remark: string;

  // 측정 설비 전용 필드
  @Column({ length: 50, nullable: true })
  deviceNo: string;

  @Column({ type: 'date', nullable: true })
  calibrationDate: Date;

  @Column({ type: 'date', nullable: true })
  nextCalibrationDate: Date;

  @Column({ length: 100, nullable: true })
  calibrationAgency: string;

  @Exclude()
  @CreateDateColumn()
  createdAt: Date;

  @Exclude()
  @UpdateDateColumn()
  updatedAt: Date;
}
