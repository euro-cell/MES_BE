import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../../common/entities/project/project.entity';
import { Customer } from '../../common/entities/shared/customer.entity';
import { PlanModule } from './plan/plan.module';
import { RouterModule } from '@nestjs/core';
import { ProductMaterialModule } from './material/material.module';
import { ProductSpecificationModule } from './specification/specification.module';
import { WorklogModule } from './worklog/worklog.module';
import { StatusModule } from './status/status.module';
import { LotModule } from './lot/lot.module';
import { BomModule } from './bom/bom.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, Customer]),
    RouterModule.register([
      { path: 'project', module: PlanModule },
      { path: 'project', module: ProductMaterialModule },
      { path: 'project', module: ProductSpecificationModule },
      { path: 'worklog', module: WorklogModule },
      { path: 'project', module: StatusModule },
      { path: 'project', module: LotModule },
      { path: 'project', module: BomModule },
    ]),
    PlanModule,
    ProductMaterialModule,
    ProductSpecificationModule,
    WorklogModule,
    StatusModule,
    LotModule,
    BomModule,
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
