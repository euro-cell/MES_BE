import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu } from '../entities/shared/menu.entity';
import { MenuPermissionByRole } from '../entities/shared/menu-permission-role.entity';
import { MenuPermissionByUser } from '../entities/shared/menu-permission-user.entity';
import { PermissionGuard } from './permission.guard';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Menu, MenuPermissionByRole, MenuPermissionByUser])],
  providers: [PermissionGuard],
  exports: [PermissionGuard, TypeOrmModule],
})
export class PermissionGuardModule {}
