import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfig } from 'src/common/configs/typeorm.config';
import { AuthModule } from 'src/modules/auth/auth.module';
import { ProductionModule } from 'src/modules/production/production.module';
import { UserModule } from 'src/modules/user/user.module';
import { MenuAccessModule } from 'src/modules/menu-access/menu-access.module';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { PermissionGuardModule } from 'src/common/guards/permission-guard.module';
import { SpecificationModule } from 'src/modules/specification/specification.module';
import { MaterialModule } from 'src/modules/material/material.module';
import { CellInventoryModule } from 'src/modules/cell-inventory/cell-inventory.module';
import { QualityModule } from 'src/modules/quality/quality.module';
import { MulterModule } from '@nestjs/platform-express';
import { multerConfig } from 'src/common/configs/multer.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useClass: TypeOrmConfig,
    }),
    MulterModule.register(multerConfig),
    PermissionGuardModule,
    AuthModule,
    ProductionModule,
    UserModule,
    MenuAccessModule,
    SpecificationModule,
    MaterialModule,
    CellInventoryModule,
    QualityModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    Reflector,
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
})
export class AppModule {}
