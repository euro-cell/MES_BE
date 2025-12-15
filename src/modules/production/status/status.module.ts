import { Module } from '@nestjs/common';
import { StatusService } from './status.service';
import { StatusController } from './status.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionPlan } from 'src/common/entities/production-plan.entity';
import { ProcessModule } from './processes/process.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProductionPlan]), ProcessModule],
  controllers: [StatusController],
  providers: [StatusService],
})
export class StatusModule {}
