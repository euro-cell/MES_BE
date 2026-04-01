import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm';
import { Menu } from './menu.entity';
import { User } from './user.entity';

@Entity('menu_permissions_by_user')
@Unique(['menu', 'user'])
export class MenuPermissionByUser {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Menu, (menu) => menu.userPermissions, { onDelete: 'CASCADE' })
  menu: Menu;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column({ default: false })
  canCreate: boolean;

  @Column({ default: false })
  canUpdate: boolean;

  @Column({ default: false })
  canDelete: boolean;
}
