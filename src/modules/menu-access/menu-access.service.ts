import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from 'src/common/entities/menu.entity';
import { User } from 'src/common/entities/user.entity';
import { MenuPermissionByUser } from 'src/common/entities/menu-permission-user.entity';

@Injectable()
export class MenuAccessService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Menu)
    private readonly menuRepo: Repository<Menu>,
    @InjectRepository(MenuPermissionByUser)
    private readonly permRepo: Repository<MenuPermissionByUser>,
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
}
