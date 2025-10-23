import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from 'src/common/entities/menu.entity';
import { User } from 'src/common/entities/user.entity';
import { MenuPermissionByUser } from 'src/common/entities/menu-permission-user.entity';
import { MenuPermissionByRole } from 'src/common/entities/menu-permission-role.entity';
import { UserRole } from 'src/common/enums/user.enum';

@Injectable()
export class MenuAccessService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Menu)
    private readonly menuRepo: Repository<Menu>,
    @InjectRepository(MenuPermissionByUser)
    private readonly permRepo: Repository<MenuPermissionByUser>,
    @InjectRepository(MenuPermissionByRole)
    private readonly rolePermRepo: Repository<MenuPermissionByRole>,
  ) {}

  /** ✅ 사용자별 권한 테이블 조회 */
  async getAllUserPermissions() {
    const users = await this.userRepo.find({ order: { id: 'ASC' } });

    const menus = await this.menuRepo.find({ order: { id: 'ASC' } });

    const perms = await this.permRepo.find({ relations: ['user', 'menu'] });

    const result = users.map((user) => {
      const userMenus: Record<string, { canCreate: boolean; canUpdate: boolean; canDelete: boolean }> = {};

      for (const menu of menus) {
        const match = perms.find((p) => p.user?.id === user.id && p.menu?.id === menu.id);

        userMenus[menu.name] = {
          canCreate: match?.canCreate ?? false,
          canUpdate: match?.canUpdate ?? false,
          canDelete: match?.canDelete ?? false,
        };
      }
      return { userId: user.id, name: user.name, menus: userMenus };
    });
    return { menus: menus.map((m) => m.name), users: result };
  }

  /** ✅ 사용자별 권한 저장 */
  async updateUserPermissions(users: any[]) {
    const allMenus = await this.menuRepo.find();

    for (const user of users) {
      const dbUser = await this.userRepo.findOne({ where: { id: user.userId } });
      if (!dbUser) continue;

      for (const [menuName, perm] of Object.entries(user.menus)) {
        const menu = allMenus.find((m) => m.name === menuName);
        if (!menu) continue;

        let record = await this.permRepo.findOne({
          where: { user: { id: dbUser.id }, menu: { id: menu.id } },
          relations: ['user', 'menu'],
        });

        if (!record) {
          record = this.permRepo.create({
            user: dbUser,
            menu,
          });
        }

        record.canCreate = !!(perm as any).canCreate;
        record.canUpdate = !!(perm as any).canUpdate;
        record.canDelete = !!(perm as any).canDelete;

        await this.permRepo.save(record);
      }
    }
    return { message: '✅ 사용자별 메뉴 권한이 저장되었습니다.' };
  }

  /** ✅ 직급별 권한 테이블 조회 */
  async getAllRolePermissions() {
    const menus = await this.menuRepo.find({ order: { id: 'ASC' } });

    const permissions = await this.rolePermRepo.find({ relations: ['menu'] });

    const allRoles: UserRole[] = [UserRole.ADMIN, UserRole.CEO, UserRole.DIRECTOR, UserRole.MANAGER, UserRole.ASSISTANT, UserRole.STAFF];

    const rolePermissions = allRoles.map((role) => {
      const roleMenus: Record<string, { canCreate: boolean; canUpdate: boolean; canDelete: boolean }> = {};

      for (const menu of menus) {
        if (role === UserRole.ADMIN) {
          roleMenus[menu.name] = {
            canCreate: true,
            canUpdate: true,
            canDelete: true,
          };
        } else {
          const found = permissions.find((p) => p.role === role && p.menu.id === menu.id);
          roleMenus[menu.name] = {
            canCreate: found?.canCreate ?? false,
            canUpdate: found?.canUpdate ?? false,
            canDelete: found?.canDelete ?? false,
          };
        }
      }
      return { role, menus: roleMenus };
    });
    return { menus: menus.map((m) => m.name), roles: rolePermissions };
  }
}
