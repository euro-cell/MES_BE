import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EquipmentManual } from 'src/common/entities/equipment/equipment-manual.entity';
import { ManualService } from './manual.service';
import { ManualController } from './manual.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EquipmentManual])],
  controllers: [ManualController],
  providers: [ManualService],
})
export class ManualModule {}
