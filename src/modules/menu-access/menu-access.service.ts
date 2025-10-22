import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from 'src/common/entities/menu.entity';
import { MenuPermissionByRole } from 'src/common/entities/menu-permission-role.entity';
import { MenuPermissionByUser } from 'src/common/entities/menu-permission-user.entity';
import { User } from 'src/common/entities/user.entity';
import { UserRole } from 'src/common/enums/user.enum';

@Injectable()
export class MenuAccessService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepo: Repository<Menu>,
    @InjectRepository(MenuPermissionByRole)
    private readonly rolePermRepo: Repository<MenuPermissionByRole>,
    @InjectRepository(MenuPermissionByUser)
    private readonly userPermRepo: Repository<MenuPermissionByUser>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /** ✅ 전체 메뉴 + 권한 조회 */
  async findAllMenusWithPermissions() {
    return this.menuRepo.find({
      relations: ['rolePermissions', 'userPermissions'],
      order: { id: 'ASC' },
    });
  }

  /** ✅ 특정 직급(Role) 기준 메뉴 권한 조회 */
  async getPermissionsByRole(role: UserRole) {
    const menus = await this.menuRepo.find({
      relations: ['rolePermissions'],
      order: { id: 'ASC' },
    });

    return menus.map((menu) => {
      const perm = menu.rolePermissions.find((p) => p.role === role);
      return {
        menuId: menu.id,
        menuName: menu.name,
        canCreate: perm?.canCreate ?? false,
        canUpdate: perm?.canUpdate ?? false,
        canDelete: perm?.canDelete ?? false,
      };
    });
  }

  /** ✅ 유저별 권한 조회 (직급 + 개인 병합) */
  async getPermissionsByUser(userId: number) {
    // 1️⃣ 유저 정보 가져오기
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new Error('사용자를 찾을 수 없습니다.');

    const role = user.role;

    // 2️⃣ 메뉴 목록 및 권한 불러오기
    const menus = await this.menuRepo.find({
      relations: ['rolePermissions', 'userPermissions', 'userPermissions.user'],
      order: { id: 'ASC' },
    });

    // 3️⃣ 병합 로직
    return menus.map((menu) => {
      const rolePerm = menu.rolePermissions.find((p) => p.role === role);
      const userPerm = menu.userPermissions.find((p) => p.user?.id === userId);

      return {
        menuId: menu.id,
        menuName: menu.name,
        canCreate: userPerm?.canCreate ?? rolePerm?.canCreate ?? false,
        canUpdate: userPerm?.canUpdate ?? rolePerm?.canUpdate ?? false,
        canDelete: userPerm?.canDelete ?? rolePerm?.canDelete ?? false,
      };
    });
  }

  /** 직급별 권한 수정 */
  async updatePositionPermissions(role: UserRole, permissions: any[]) {
    for (const perm of permissions) {
      const { menuId, canCreate, canUpdate, canDelete } = perm;

      let record = await this.rolePermRepo.findOne({
        where: { menu: { id: menuId }, role },
        relations: ['menu'],
      });

      if (!record) {
        record = this.rolePermRepo.create({
          menu: { id: menuId } as Menu,
          role,
        });
      }

      record.canCreate = !!canCreate;
      record.canUpdate = !!canUpdate;
      record.canDelete = !!canDelete;
      await this.rolePermRepo.save(record);
    }

    return { message: '직급별 메뉴 권한이 업데이트되었습니다.' };
  }

  /** 사용자별 권한 수정 */
  async updateUserPermissions(userId: number, permissions: any[]) {
    for (const perm of permissions) {
      const { menuId, canCreate, canUpdate, canDelete } = perm;

      let record = await this.userPermRepo.findOne({
        where: { menu: { id: menuId }, user: { id: userId } },
        relations: ['menu', 'user'],
      });

      if (!record) {
        record = this.userPermRepo.create({
          menu: { id: menuId } as Menu,
          user: { id: userId } as any,
        });
      }

      record.canCreate = !!canCreate;
      record.canUpdate = !!canUpdate;
      record.canDelete = !!canDelete;
      await this.userPermRepo.save(record);
    }

    return { message: '사용자별 메뉴 권한이 업데이트되었습니다.' };
  }
}
