import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FormationService } from './formation.service';
import { FormationController } from './formation.controller';
import { WorklogFormation } from 'src/common/entities/worklogs/worklog-13-formation.entity';
import { EquipmentModule } from 'src/modules/equipment/equipment.module';

@Module({
  imports: [TypeOrmModule.forFeature([WorklogFormation]), EquipmentModule],
  controllers: [FormationController],
  providers: [FormationService],
})
export class FormationModule {}
