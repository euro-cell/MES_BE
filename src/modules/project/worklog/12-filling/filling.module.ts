import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FillingService } from './filling.service';
import { FillingController } from './filling.controller';
import { WorklogFilling } from '../../../../common/entities/worklog/worklog-12-filling.entity';
import { MaterialModule } from '../../../material/material.module';
import { EquipmentModule } from '../../../equipment/equipment.module';

@Module({
  imports: [TypeOrmModule.forFeature([WorklogFilling]), MaterialModule, EquipmentModule],
  controllers: [FillingController],
  providers: [FillingService],
})
export class FillingModule {}
