import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SealingService } from './sealing.service';
import { SealingController } from './sealing.controller';
import { WorklogSealing } from '../../../../common/entities/worklog/worklog-11-sealing.entity';
import { EquipmentModule } from '../../../equipment/equipment.module';

@Module({
  imports: [TypeOrmModule.forFeature([WorklogSealing]), EquipmentModule],
  controllers: [SealingController],
  providers: [SealingService],
})
export class SealingModule {}
