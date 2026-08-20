import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validateEnv } from '../common/configs/env.validation';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfig } from '../common/configs/typeorm.config';
import { AuthModule } from '../modules/auth/auth.module';
import { ProjectModule } from '../modules/project/project.module';
import { UserModule } from '../modules/user/user.module';
import { MenuAccessModule } from '../modules/menu-access/menu-access.module';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { PermissionGuard } from '../common/guards/permission.guard';
import { PermissionGuardModule } from '../common/guards/permission-guard.module';
import { SpecificationModule } from '../modules/specification/specification.module';
import { MaterialModule } from '../modules/material/material.module';
import { CellInventoryModule } from '../modules/cell-inventory/cell-inventory.module';
import { QualityModule } from '../modules/quality/quality.module';
import { MulterModule } from '@nestjs/platform-express';
import { multerConfig } from '../common/configs/multer.config';
import { DrawingModule } from '../modules/drawing/drawing.module';
import { EquipmentModule } from '../modules/equipment/equipment.module';
import { CommonModule } from '../common/common.module';
import { DashboardModule } from '../modules/dashboard/dashboard.module';
import { CustomerModule } from '../modules/customer/customer.module';
import { RequestLoggerMiddleware } from '../common/middleware/request-logger.middleware';
import { SessionRefreshMiddleware } from '../common/middleware/session-refresh.middleware';
import { UniverViewerProxyMiddleware } from '../common/middleware/univer-viewer-proxy.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useClass: TypeOrmConfig,
    }),
    ScheduleModule.forRoot(),
    MulterModule.register(multerConfig),
    CommonModule,
    PermissionGuardModule,
    AuthModule,
    ProjectModule,
    UserModule,
    MenuAccessModule,
    SpecificationModule,
    MaterialModule,
    CellInventoryModule,
    QualityModule,
    DrawingModule,
    EquipmentModule,
    DashboardModule,
    CustomerModule,
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
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UniverViewerProxyMiddleware).forRoutes('univer-viewer*path');
    consumer.apply(RequestLoggerMiddleware, SessionRefreshMiddleware).forRoutes('*');
  }
}
