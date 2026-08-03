import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlurryService } from './slurry.service';
import { SlurryController } from './slurry.controller';
import { WorklogSlurry } from '../../../../common/entities/worklog/worklog-02-slurry.entity';
import { MaterialModule } from '../../../material/material.module';
import { EquipmentModule } from '../../../equipment/equipment.module';

@Module({
  imports: [TypeOrmModule.forFeature([WorklogSlurry]), MaterialModule, EquipmentModule],
  controllers: [SlurryController],
  providers: [SlurryService],
})
export class SlurryModule {}
