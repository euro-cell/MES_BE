import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BinderService } from './binder.service';
import { BinderController } from './binder.controller';
import { WorklogBinder } from 'src/common/entities/worklogs/worklog-01-binder.entity';
import { MaterialModule } from 'src/modules/material/material.module';
import { EquipmentModule } from 'src/modules/equipment/equipment.module';

@Module({
  imports: [TypeOrmModule.forFeature([WorklogBinder]), MaterialModule, EquipmentModule],
  controllers: [BinderController],
  providers: [BinderService],
})
export class BinderModule {}
