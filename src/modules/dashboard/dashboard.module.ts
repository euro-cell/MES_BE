import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Production } from 'src/common/entities/production.entity';
import { StatusModule } from '../production/status/status.module';

@Module({
  imports: [TypeOrmModule.forFeature([Production]), StatusModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
