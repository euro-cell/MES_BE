import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EquipmentService } from './equipment.service';
import { EquipmentController } from './equipment.controller';
import { Equipment } from 'src/common/entities/equipment.entity';
import { MaintenanceModule } from './maintenance/maintenance.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Equipment]),
    RouterModule.register([
      {
        path: 'equipment',
        children: [{ path: 'maintenance', module: MaintenanceModule }],
      },
    ]),
    MaintenanceModule,
  ],
  controllers: [EquipmentController],
  providers: [EquipmentService],
  exports: [EquipmentService],
})
export class EquipmentModule {}
