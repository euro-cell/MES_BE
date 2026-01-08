import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterModule } from '@nestjs/core';
import { CellInventory } from 'src/common/entities/cell-inventory.entity';
import { CellInventoryService } from './cell-inventory.service';
import { CellInventoryController } from './cell-inventory.controller';
import { NcrModule } from './ncr/ncr.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CellInventory]),
    NcrModule,
    RouterModule.register([
      {
        path: 'cell-inventory',
        children: [
          {
            path: 'ncr',
            module: NcrModule,
          },
        ],
      },
    ]),
  ],
  controllers: [CellInventoryController],
  providers: [CellInventoryService],
  exports: [CellInventoryService],
})
export class CellInventoryModule {}
