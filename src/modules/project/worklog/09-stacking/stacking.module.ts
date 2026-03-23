import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StackingService } from './stacking.service';
import { StackingController } from './stacking.controller';
import { WorklogStacking } from 'src/common/entities/worklogs/worklog-09-stacking.entity';
import { MaterialModule } from 'src/modules/material/material.module';
import { EquipmentModule } from 'src/modules/equipment/equipment.module';

@Module({
  imports: [TypeOrmModule.forFeature([WorklogStacking]), MaterialModule, EquipmentModule],
  controllers: [StackingController],
  providers: [StackingService],
})
export class StackingModule {}
