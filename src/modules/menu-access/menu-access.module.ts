import { Module } from '@nestjs/common';
import { MenuAccessService } from './menu-access.service';
import { MenuAccessController } from './menu-access.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu } from 'src/common/entities/shared/menu.entity';
import { MenuPermissionByRole } from 'src/common/entities/shared/menu-permission-role.entity';
import { MenuPermissionByUser } from 'src/common/entities/shared/menu-permission-user.entity';
import { User } from 'src/common/entities/shared/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Menu, MenuPermissionByRole, MenuPermissionByUser, User])],
  controllers: [MenuAccessController],
  providers: [MenuAccessService],
})
export class MenuAccessModule {}
