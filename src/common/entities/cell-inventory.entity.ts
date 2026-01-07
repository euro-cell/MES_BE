import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { CellGrade } from '../enums/cell-inventory.enum';
import { Exclude } from 'class-transformer';

@Entity('cell_inventories')
export class CellInventory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  lotNo: string;

  @Column({ type: 'varchar', length: 100 })
  projectName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  projectNo: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  model: string | null;

  @Column({ type: 'enum', enum: CellGrade, default: CellGrade.GOOD })
  grade: CellGrade;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ncrGrade: string | null;

  @Column({ type: 'date' })
  storageDate: Date;

  @Column({ type: 'varchar', length: 100 })
  storageLocation: string;

  @Column({ type: 'date', nullable: true })
  shippingDate: Date | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  shippingStatus: string | null;

  @Column({ type: 'varchar', length: 50 })
  deliverer: string;

  @Column({ type: 'varchar', length: 50 })
  receiver: string;

  @Column({ type: 'text', nullable: true })
  details: string | null;

  @Column({ type: 'boolean', default: false, nullable: true })
  isShipped: boolean | null;

  @Column({ type: 'boolean', default: false, nullable: true })
  isRestocked: boolean | null;

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
