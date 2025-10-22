import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { MenuAccessService } from './menu-access.service';
import { UserRole } from 'src/common/enums/user.enum';
import { GetUserId, GetUserRole } from 'src/common/decorators/user.decorator';
import { SessionAuthGuard } from 'src/common/guards/session-auth.guard';

@UseGuards(SessionAuthGuard) // ✅ 세션 로그인 유저만 접근 가능
@Controller('permission')
export class MenuAccessController {
  constructor(private readonly service: MenuAccessService) {}

  /** ✅ 전체 메뉴 + 권한 조회 */
  @Get()
  async findAll() {
    return this.service.findAllMenusWithPermissions();
  }

  /** ✅ 현재 로그인한 유저의 권한 조회 */
  @Get('user')
  async getUserPermissions(@GetUserId() userId: number) {
    return this.service.getPermissionsByUser(userId);
  }

  /** ✅ 자신의 직급(Role) 기준 메뉴 권한 조회 */
  @Get('role')
  async getRolePermissions(@GetUserRole() role: UserRole) {
    return this.service.getPermissionsByRole(role);
  }

  /** ✅ 자신의 직급(Role) 권한 수정 (관리자만 사용 가능) */
  @Put('role')
  async updateRolePermissions(@GetUserRole() role: UserRole, @Body() body: any[]) {
    return this.service.updatePositionPermissions(role, body);
  }

  /** ✅ 자신의 유저 권한 수정 (예: 관리자가 특정 유저의 예외 권한 설정) */
  @Put('user')
  async updateUserPermissions(@GetUserId() userId: number, @Body() body: any[]) {
    return this.service.updateUserPermissions(userId, body);
  }
}
