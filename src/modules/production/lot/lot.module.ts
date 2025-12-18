import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LotService } from './lot.service';
import { LotController } from './lot.controller';
import { MixingService } from './electrode/mixing.service';
import { LotMixing } from '../../../common/entities/lots/lot-01-mixing.entity';
import { LotSync } from '../../../common/entities/lots/lot-sync.entity';
import { WorklogBinder } from '../../../common/entities/worklogs/worklog-01-binder.entity';
import { WorklogSlurry } from '../../../common/entities/worklogs/worklog-02-slurry.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LotMixing, LotSync, WorklogBinder, WorklogSlurry]),
  ],
  controllers: [LotController],
  providers: [LotService, MixingService],
})
export class LotModule {}
