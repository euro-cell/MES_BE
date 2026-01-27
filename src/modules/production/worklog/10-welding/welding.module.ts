import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WeldingService } from './welding.service';
import { WeldingController } from './welding.controller';
import { WorklogWelding } from 'src/common/entities/worklogs/worklog-10-welding.entity';
import { MaterialModule } from 'src/modules/material/material.module';
import { EquipmentModule } from 'src/modules/equipment/equipment.module';

@Module({
  imports: [TypeOrmModule.forFeature([WorklogWelding]), MaterialModule, EquipmentModule],
  controllers: [WeldingController],
  providers: [WeldingService],
})
export class WeldingModule {}
