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

@Module({
  imports: [
    TypeOrmModule.forFeature([Production]),
    RouterModule.register([
      { path: 'production', module: PlanModule },
      { path: 'production', module: ProductMaterialModule },
      { path: 'production', module: ProductSpecificationModule },
      { path: 'worklog', module: WorklogModule },
    ]),
    PlanModule,
    ProductMaterialModule,
    ProductSpecificationModule,
    WorklogModule,
  ],
  controllers: [ProductionController],
  providers: [ProductionService],
  exports: [ProductionService],
})
export class ProductionModule {}
