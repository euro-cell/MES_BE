import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LotService } from './lot.service';
import { LotController } from './lot.controller';
import { MixingService } from './electrode/mixing.service';
import { CoatingService } from './electrode/coating.service';
import { LotMixing } from '../../../common/entities/lots/lot-01-mixing.entity';
import { LotCoating } from '../../../common/entities/lots/lot-02-coating.entity';
import { LotSync } from '../../../common/entities/lots/lot-sync.entity';
import { WorklogBinder } from '../../../common/entities/worklogs/worklog-01-binder.entity';
import { WorklogSlurry } from '../../../common/entities/worklogs/worklog-02-slurry.entity';
import { WorklogCoating } from '../../../common/entities/worklogs/worklog-03-coating.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LotMixing,
      LotCoating,
      LotSync,
      WorklogBinder,
      WorklogSlurry,
      WorklogCoating,
    ]),
  ],
  controllers: [LotController],
  providers: [LotService, MixingService, CoatingService],
})
export class LotModule {}
