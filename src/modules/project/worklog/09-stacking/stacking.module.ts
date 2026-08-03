import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StackingService } from './stacking.service';
import { StackingController } from './stacking.controller';
import { WorklogStacking } from '../../../../common/entities/worklog/worklog-09-stacking.entity';
import { MaterialModule } from '../../../material/material.module';
import { EquipmentModule } from '../../../equipment/equipment.module';

@Module({
  imports: [TypeOrmModule.forFeature([WorklogStacking]), MaterialModule, EquipmentModule],
  controllers: [StackingController],
  providers: [StackingService],
})
export class StackingModule {}
