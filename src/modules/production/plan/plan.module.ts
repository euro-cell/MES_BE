import { Module } from '@nestjs/common';
import { PlanService } from './plan.service';
import { PlanController } from './plan.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionPlan } from '../../../common/entities/production-plan.entity';
import { Production } from '../../../common/entities/production.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductionPlan, Production])],
  controllers: [PlanController],
  providers: [PlanService],
})
export class PlanModule {}
