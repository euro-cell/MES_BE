import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PressController } from './press.controller';
import { PressService } from './press.service';
import { WorklogPress } from 'src/common/entities/worklog/worklog-04-press.entity';
import { EquipmentModule } from 'src/modules/equipment/equipment.module';

@Module({
  imports: [TypeOrmModule.forFeature([WorklogPress]), EquipmentModule],
  controllers: [PressController],
  providers: [PressService],
})
export class PressModule {}
