import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FillingService } from './filling.service';
import { FillingController } from './filling.controller';
import { WorklogFilling } from 'src/common/entities/worklogs/worklog-12-filling.entity';
import { MaterialModule } from 'src/modules/material/material.module';
import { EquipmentModule } from 'src/modules/equipment/equipment.module';

@Module({
  imports: [TypeOrmModule.forFeature([WorklogFilling]), MaterialModule, EquipmentModule],
  controllers: [FillingController],
  providers: [FillingService],
})
export class FillingModule {}
