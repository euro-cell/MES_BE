import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VdService } from './vd.service';
import { VdController } from './vd.controller';
import { WorklogVd } from 'src/common/entities/worklogs/worklog-07-vd.entity';
import { EquipmentModule } from 'src/modules/equipment/equipment.module';

@Module({
  imports: [TypeOrmModule.forFeature([WorklogVd]), EquipmentModule],
  controllers: [VdController],
  providers: [VdService],
})
export class VdModule {}
