import { Module } from '@nestjs/common';
import { PlanService } from './plan.service';
import { PlanController } from './plan.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectPlan } from '../../../common/entities/project-plan.entity';
import { Project } from '../../../common/entities/project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectPlan, Project])],
  controllers: [PlanController],
  providers: [PlanService],
})
export class PlanModule {}
