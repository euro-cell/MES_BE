import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../../common/entities/project.entity';
import { PlanModule } from './plan/plan.module';

@Module({
  imports: [TypeOrmModule.forFeature([Project]), PlanModule],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
