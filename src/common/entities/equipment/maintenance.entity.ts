import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Equipment } from './equipment.entity';

@Entity('maintenances')
export class Maintenance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  equipmentId: number;

  @ManyToOne(() => Equipment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'equipment_id' })
  equipment: Equipment;

  @Column({ type: 'date' })
  inspectionDate: Date;

  @Column({ type: 'text', nullable: true })
  replacementHistory: string;

  @Column({ type: 'text', nullable: true })
  usedParts: string;

  @Column({ type: 'text', nullable: true })
  maintainer: string;

  @Column({ type: 'text', nullable: true })
  verifier: string;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @Exclude()
  @CreateDateColumn()
  createdAt: Date;

  @Exclude()
  @UpdateDateColumn()
  updatedAt: Date;
}
