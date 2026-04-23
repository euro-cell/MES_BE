import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterDto, UpdateUserDto } from 'src/common/dtos/shared/user.dto';
import { SessionAuthGuard } from 'src/common/guards/session-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { RequirePermission } from 'src/common/decorators/permission.decorator';
import { MenuName, PermissionAction } from 'src/common/enums/menu.enum';

@UseGuards(SessionAuthGuard, PermissionGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @RequirePermission(MenuName.USER_MANAGEMENT, PermissionAction.CREATE)
  async createUser(@Body() dto: RegisterDto) {
    await this.userService.createUser(dto);
  }

  @Get()
  async getAllUsers() {
    return this.userService.findAll();
  }

  @Patch(':id')
  @RequirePermission(MenuName.USER_MANAGEMENT, PermissionAction.UPDATE)
  async updateUser(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    await this.userService.updateUser(id, dto);
  }

  @Delete(':id')
  @RequirePermission(MenuName.USER_MANAGEMENT, PermissionAction.DELETE)
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    await this.userService.deleteUser(id);
  }
}
