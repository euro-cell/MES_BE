import { Module } from '@nestjs/common';
import { StatusService } from './status.service';
import { StatusController } from './status.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionPlan } from 'src/common/entities/production-plan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductionPlan])],
  controllers: [StatusController],
  providers: [StatusService],
})
export class StatusModule {}
