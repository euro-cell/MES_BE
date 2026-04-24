import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { MenuAccessService } from './menu-access.service';
import { SessionAuthGuard } from 'src/common/guards/session-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { RequirePermission } from 'src/common/decorators/permission.decorator';
import { MenuName, PermissionAction } from 'src/common/enums/menu.enum';

@Controller('permission')
@UseGuards(SessionAuthGuard, PermissionGuard)
export class MenuAccessController {
  constructor(private readonly service: MenuAccessService) {}

  @Get('user')
  async getAllUserPermissions() {
    return this.service.getAllUserPermissions();
  }

  @Put('user')
  @RequirePermission(MenuName.MENU_ACCESS, PermissionAction.UPDATE)
  async updateUserPermissions(@Body() users: any[]) {
    return this.service.updateUserPermissions(users);
  }

  @Get('role')
  async getAllRolePermissions() {
    return this.service.getAllRolePermissions();
  }

  @Put('role')
  @RequirePermission(MenuName.MENU_ACCESS, PermissionAction.UPDATE)
  async updateRolePermissions(@Body() rolesData: any[]) {
    return this.service.updateRolePermissions(rolesData);
  }
}
