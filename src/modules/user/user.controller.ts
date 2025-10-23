import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterDto, UpdateUserDto } from 'src/common/dtos/user.dto';
import { SessionAuthGuard } from 'src/common/guards/session-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { RequirePermission } from 'src/common/decorators/permission.decorator';

@UseGuards(SessionAuthGuard, PermissionGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @RequirePermission('인원관리', 'create')
  async createUser(@Body() dto: RegisterDto) {
    await this.userService.createUser(dto);
  }

  @Get()
  async getAllUsers() {
    return this.userService.findAll();
  }

  @Patch(':id')
  @RequirePermission('인원관리', 'update')
  async updateUser(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    await this.userService.updateUser(id, dto);
  }

  @Delete(':id')
  @RequirePermission('인원관리', 'delete')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    await this.userService.deleteUser(id);
  }
}
