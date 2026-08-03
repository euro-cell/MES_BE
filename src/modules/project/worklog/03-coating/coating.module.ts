import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoatingService } from './coating.service';
import { CoatingController } from './coating.controller';
import { WorklogCoating } from '../../../../common/entities/worklog/worklog-03-coating.entity';
import { MaterialModule } from '../../../material/material.module';
import { EquipmentModule } from '../../../equipment/equipment.module';

@Module({
  imports: [TypeOrmModule.forFeature([WorklogCoating]), MaterialModule, EquipmentModule],
  controllers: [CoatingController],
  providers: [CoatingService],
})
export class CoatingModule {}
