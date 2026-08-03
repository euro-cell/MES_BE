import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BinderService } from './binder.service';
import { BinderController } from './binder.controller';
import { WorklogBinder } from '../../../../common/entities/worklog/worklog-01-binder.entity';
import { MaterialModule } from '../../../material/material.module';
import { EquipmentModule } from '../../../equipment/equipment.module';

@Module({
  imports: [TypeOrmModule.forFeature([WorklogBinder]), MaterialModule, EquipmentModule],
  controllers: [BinderController],
  providers: [BinderService],
})
export class BinderModule {}
