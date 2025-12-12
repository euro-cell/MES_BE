import { Module } from '@nestjs/common';
import { ProductionService } from './production.service';
import { ProductionController } from './production.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Production } from '../../common/entities/production.entity';
import { PlanModule } from './plan/plan.module';
import { RouterModule } from '@nestjs/core';
import { ProductMaterialModule } from './material/material.module';
import { ProductSpecificationModule } from './specification/specification.module';
import { WorklogModule } from './worklog/worklog.module';
import { StatusModule } from './status/status.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Production]),
    RouterModule.register([
      { path: 'production', module: PlanModule },
      { path: 'production', module: ProductMaterialModule },
      { path: 'production', module: ProductSpecificationModule },
      { path: 'worklog', module: WorklogModule },
      { path: 'production', module: StatusModule },
    ]),
    PlanModule,
    ProductMaterialModule,
    ProductSpecificationModule,
    WorklogModule,
    StatusModule,
  ],
  controllers: [ProductionController],
  providers: [ProductionService],
  exports: [ProductionService],
})
export class ProductionModule {}
