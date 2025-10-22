import { Module } from '@nestjs/common';
import { ProductionService } from './production.service';
import { ProductionController } from './production.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Production } from '../../common/entities/production.entity';
import { PlanModule } from './plan/plan.module';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [TypeOrmModule.forFeature([Production]), RouterModule.register([{ path: 'production', module: PlanModule }]), PlanModule],
  controllers: [ProductionController],
  providers: [ProductionService],
  exports: [ProductionService],
})
export class ProductionModule {}
