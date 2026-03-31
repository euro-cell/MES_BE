import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Equipment } from './equipment.entity';

@Entity('equipment_manuals')
export class EquipmentManual {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Equipment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'equipment_id' })
  equipment: Equipment;

  @Column({ type: 'varchar', length: 255 })
  fileName: string;

  @Column({ type: 'varchar', length: 500 })
  filePath: string;

  @CreateDateColumn()
  createdAt: Date;
}
