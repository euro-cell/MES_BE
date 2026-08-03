import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradingService } from './grading.service';
import { GradingController } from './grading.controller';
import { WorklogGrading } from '../../../../common/entities/worklog/worklog-14-grading.entity';
import { EquipmentModule } from '../../../equipment/equipment.module';

@Module({
  imports: [TypeOrmModule.forFeature([WorklogGrading]), EquipmentModule],
  controllers: [GradingController],
  providers: [GradingService],
})
export class GradingModule {}
