import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Project } from 'src/common/entities/project.entity';
import { StatusModule } from '../project/status/status.module';

@Module({
  imports: [TypeOrmModule.forFeature([Project]), StatusModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
