import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SealingService } from './sealing.service';
import { SealingController } from './sealing.controller';
import { WorklogSealing } from 'src/common/entities/worklogs/worklog-11-sealing.entity';
import { EquipmentModule } from 'src/modules/equipment/equipment.module';

@Module({
  imports: [TypeOrmModule.forFeature([WorklogSealing]), EquipmentModule],
  controllers: [SealingController],
  providers: [SealingService],
})
export class SealingModule {}
