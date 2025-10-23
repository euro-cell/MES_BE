import { Body, Controller, Get, Put } from '@nestjs/common';
import { MenuAccessService } from './menu-access.service';

@Controller('permission')
export class MenuAccessController {
  constructor(private readonly service: MenuAccessService) {}

  @Get('user')
  async getAllUserPermissions() {
    return this.service.getAllUserPermissions();
  }

  @Put('user')
  async updateUserPermissions(@Body() users: any[]) {
    return this.service.updateUserPermissions(users);
  }

  @Get('role')
  async getAllRolePermissions() {
    return this.service.getAllRolePermissions();
  }

  @Put('role')
  async updateRolePermissions(@Body() rolesData: any[]) {
    return this.service.updateRolePermissions(rolesData);
  }
}
