import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FormationService } from './formation.service';
import { FormationController } from './formation.controller';
import { WorklogFormation } from '../../../../common/entities/worklog/worklog-13-formation.entity';
import { EquipmentModule } from '../../../equipment/equipment.module';

@Module({
  imports: [TypeOrmModule.forFeature([WorklogFormation]), EquipmentModule],
  controllers: [FormationController],
  providers: [FormationService],
})
export class FormationModule {}
