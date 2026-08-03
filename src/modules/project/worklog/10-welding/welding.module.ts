import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WeldingService } from './welding.service';
import { WeldingController } from './welding.controller';
import { WorklogWelding } from '../../../../common/entities/worklog/worklog-10-welding.entity';
import { MaterialModule } from '../../../material/material.module';
import { EquipmentModule } from '../../../equipment/equipment.module';

@Module({
  imports: [TypeOrmModule.forFeature([WorklogWelding]), MaterialModule, EquipmentModule],
  controllers: [WeldingController],
  providers: [WeldingService],
})
export class WeldingModule {}
