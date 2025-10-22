import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm';
import { Menu } from './menu.entity';
import { UserRole } from '../enums/user.enum';

@Entity('menu_permissions_by_role')
@Unique(['menu', 'role'])
export class MenuPermissionByRole {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Menu, (menu) => menu.rolePermissions, { onDelete: 'CASCADE' })
  menu: Menu;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ default: false })
  canCreate: boolean;

  @Column({ default: false })
  canUpdate: boolean;

  @Column({ default: false })
  canDelete: boolean;
}
