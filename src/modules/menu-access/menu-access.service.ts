import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from 'src/common/entities/shared/menu.entity';
import { User } from 'src/common/entities/shared/user.entity';
import { MenuPermissionByUser } from 'src/common/entities/shared/menu-permission-user.entity';
import { MenuPermissionByRole } from 'src/common/entities/shared/menu-permission-role.entity';
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

  /** 트리 순서(부모 displayOrder → 자식 displayOrder)로 메뉴 정렬 + depth 계산 */
  private sortMenusAsTree(menus: Menu[]): { name: string; depth: number }[] {
    const result: { name: string; depth: number }[] = [];
    const roots = menus.filter((m) => !m.parentId).sort((a, b) => a.displayOrder - b.displayOrder);
    const addNode = (node: Menu, depth: number) => {
      result.push({ name: node.name, depth });
      const children = menus.filter((m) => m.parentId === node.id).sort((a, b) => a.displayOrder - b.displayOrder);
      children.forEach((child) => addNode(child, depth + 1));
    };
    roots.forEach((root) => addNode(root, 1));
    return result;
  }

  /** ✅ 사용자별 권한 테이블 조회 */
  async getAllUserPermissions() {
    const users = await this.userRepo.find({ order: { id: 'ASC' } });

    const allMenus = await this.menuRepo.find();
    const sortedMenus = this.sortMenusAsTree(allMenus);

    const perms = await this.permRepo.find({ relations: ['user', 'menu'] });

    const result = users.map((user) => {
      const userMenus: Record<string, { canCreate: boolean; canUpdate: boolean; canDelete: boolean }> = {};

      for (const { name } of sortedMenus) {
        const menuEntity = allMenus.find((m) => m.name === name)!;
        const match = perms.find((p) => p.user?.id === user.id && p.menu?.id === menuEntity.id);

        userMenus[name] = {
          canCreate: match?.canCreate ?? false,
          canUpdate: match?.canUpdate ?? false,
          canDelete: match?.canDelete ?? false,
        };
      }
      return { userId: user.id, name: user.name, menus: userMenus };
    });
    return { menus: sortedMenus, users: result };
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
    const allMenus = await this.menuRepo.find();
    const sortedMenus = this.sortMenusAsTree(allMenus);

    const permissions = await this.rolePermRepo.find({ relations: ['menu'] });

    const allRoles: UserRole[] = [UserRole.ADMIN, UserRole.CEO, UserRole.DIRECTOR, UserRole.MANAGER, UserRole.ASSISTANT, UserRole.STAFF];

    const rolePermissions = allRoles.map((role) => {
      const roleMenus: Record<string, { canCreate: boolean; canUpdate: boolean; canDelete: boolean }> = {};

      for (const { name } of sortedMenus) {
        const menuEntity = allMenus.find((m) => m.name === name)!;
        if (role === UserRole.ADMIN) {
          roleMenus[name] = { canCreate: true, canUpdate: true, canDelete: true };
        } else {
          const found = permissions.find((p) => p.role === role && p.menu.id === menuEntity.id);
          roleMenus[name] = {
            canCreate: found?.canCreate ?? false,
            canUpdate: found?.canUpdate ?? false,
            canDelete: found?.canDelete ?? false,
          };
        }
      }
      return { role, menus: roleMenus };
    });
    return { menus: sortedMenus, roles: rolePermissions };
  }

  /** ✅ 직급별 권한 저장 */
  async updateRolePermissions(rolesData: any[]) {
    const allMenus = await this.menuRepo.find();

    for (const roleData of rolesData) {
      const { role, menus } = roleData;

      if (role === UserRole.ADMIN) continue;

      for (const [menuName, perm] of Object.entries(menus)) {
        const menu = allMenus.find((m) => m.name === menuName);
        if (!menu) continue;

        let record = await this.rolePermRepo.findOne({ where: { menu: { id: menu.id }, role }, relations: ['menu'] });

        if (!record) {
          record = this.rolePermRepo.create({ menu, role });
        }

        record.canCreate = !!(perm as any).canCreate;
        record.canUpdate = !!(perm as any).canUpdate;
        record.canDelete = !!(perm as any).canDelete;

        await this.rolePermRepo.save(record);
      }
    }
    return { message: '✅ 직급별 메뉴 권한이 저장되었습니다.' };
  }
}
