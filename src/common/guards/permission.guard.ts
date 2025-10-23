import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from '../entities/menu.entity';
import { MenuPermissionByRole } from '../entities/menu-permission-role.entity';
import { MenuPermissionByUser } from '../entities/menu-permission-user.entity';
import { User } from '../entities/user.entity';
import { UserRole } from '../enums/user.enum';
import { PERMISSION_KEY } from '../decorators/permission.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(Menu) private readonly menuRepo: Repository<Menu>,
    @InjectRepository(MenuPermissionByRole)
    private readonly rolePermRepo: Repository<MenuPermissionByRole>,
    @InjectRepository(MenuPermissionByUser)
    private readonly userPermRepo: Repository<MenuPermissionByUser>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { method } = request;

    if (method === 'GET') return true;

    const requiredPerm = this.reflector.getAllAndOverride<{ menu: string; action: 'create' | 'update' | 'delete' }>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredPerm) return true;

    const user: User = request.user;
    if (!user) throw new ForbiddenException('로그인이 필요합니다.');

    if (user.role === UserRole.ADMIN) return true;

    const menu = await this.menuRepo.findOne({ where: { name: requiredPerm.menu } });
    if (!menu) throw new ForbiddenException('잘못된 메뉴 이름입니다.');

    const userPerm = await this.userPermRepo.findOne({
      where: { user: { id: user.id }, menu: { id: menu.id } },
      relations: ['menu', 'user'],
    });
    if (userPerm && userPerm[`can${capitalize(requiredPerm.action)}`]) return true;

    const rolePerm = await this.rolePermRepo.findOne({
      where: { role: user.role, menu: { id: menu.id } },
      relations: ['menu'],
    });
    if (rolePerm && rolePerm[`can${capitalize(requiredPerm.action)}`]) return true;

    throw new ForbiddenException('이 작업에 대한 권한이 없습니다.');
  }
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
