import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Production } from './production.entity';

@Entity('production_specifications')
export class ProductionSpecification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'jsonb', nullable: true })
  cathode: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  anode: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  assembly: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  cell: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date | null;

  @OneToOne(() => Production, (production) => production.productionSpecifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productionId' })
  production: Production;
}
