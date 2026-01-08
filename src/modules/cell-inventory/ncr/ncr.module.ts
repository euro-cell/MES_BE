import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CellNcr } from 'src/common/entities/cell-ncr.entity';
import { CellNcrDetail } from 'src/common/entities/cell-ncr-detail.entity';
import { CellInventory } from 'src/common/entities/cell-inventory.entity';
import { NcrService } from './ncr.service';
import { NcrController } from './ncr.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CellNcr, CellNcrDetail, CellInventory])],
  controllers: [NcrController],
  providers: [NcrService],
})
export class NcrModule {}
