import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Production } from './production.entity';
import { CreateBatteryDesignDto } from '../dtos/specification.dto';

@Entity('specifications')
export class Specification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'jsonb', nullable: true })
  cathode: CreateBatteryDesignDto['cathode'];

  @Column({ type: 'jsonb', nullable: true })
  anode: CreateBatteryDesignDto['anode'];

  @Column({ type: 'jsonb', nullable: true })
  assembly: CreateBatteryDesignDto['assembly'];

  @Column({ type: 'jsonb', nullable: true })
  cell: CreateBatteryDesignDto['cell'];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @OneToOne(() => Production, (production) => production.specification, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productionId' })
  production: Production;
}
