import { Module } from '@nestjs/common';
import { PlanService } from './plan.service';
import { PlanController } from './plan.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectPlan } from '../../../common/entities/project/project-plan.entity';
import { ProjectPlanItem } from '../../../common/entities/project/project-plan-item.entity';
import { Project } from '../../../common/entities/project/project.entity';
import { ProcessTemplate } from '../../../common/entities/project/process-template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectPlan, ProjectPlanItem, Project, ProcessTemplate])],
  controllers: [PlanController],
  providers: [PlanService],
})
export class PlanModule {}
