import { Module } from '@nestjs/common';
import { StatusService } from './status.service';
import { StatusController } from './status.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectPlan } from 'src/common/entities/project/project-plan.entity';
import { ProcessModule } from './processes/process.module';
import { ProjectTarget } from 'src/common/entities/project/project-target.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectPlan, ProjectTarget]), ProcessModule],
  controllers: [StatusController],
  providers: [StatusService],
  exports: [StatusService],
})
export class StatusModule {}
