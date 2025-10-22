import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { MenuPermissionByRole } from './menu-permission-role.entity';
import { MenuPermissionByUser } from './menu-permission-user.entity';

@Entity('menus')
export class Menu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 100, nullable: true })
  path: string;

  @Column({ nullable: true })
  parentId: number;
  @OneToMany(() => MenuPermissionByRole, (perm: MenuPermissionByRole) => perm.menu)
  rolePermissions: MenuPermissionByRole[];

  @OneToMany(() => MenuPermissionByUser, (perm: MenuPermissionByUser) => perm.menu)
  userPermissions: MenuPermissionByUser[];
}
