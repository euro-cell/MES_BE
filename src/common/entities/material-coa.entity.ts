import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Material } from './material.entity';

@Entity('material_coas')
export class MaterialCoa {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Material, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'material_id' })
  material: Material;

  @Column({ type: 'varchar', length: 20 })
  process: string;

  @Column({ type: 'varchar', length: 255 })
  fileName: string;

  @Column({ type: 'varchar', length: 500 })
  filePath: string;

  @CreateDateColumn()
  createdAt: Date;
}
