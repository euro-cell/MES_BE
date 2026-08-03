import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FormingService } from './forming.service';
import { FormingController } from './forming.controller';
import { WorklogForming } from '../../../../common/entities/worklog/worklog-08-forming.entity';
import { MaterialModule } from '../../../material/material.module';
import { EquipmentModule } from '../../../equipment/equipment.module';

@Module({
  imports: [TypeOrmModule.forFeature([WorklogForming]), MaterialModule, EquipmentModule],
  controllers: [FormingController],
  providers: [FormingService],
})
export class FormingModule {}
