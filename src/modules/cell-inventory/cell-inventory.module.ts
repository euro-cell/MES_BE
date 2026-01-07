import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CellInventory } from 'src/common/entities/cell-inventory.entity';
import { CellInventoryService } from './cell-inventory.service';
import { CellInventoryController } from './cell-inventory.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CellInventory])],
  controllers: [CellInventoryController],
  providers: [CellInventoryService],
  exports: [CellInventoryService],
})
export class CellInventoryModule {}
