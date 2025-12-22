import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LotService } from './lot.service';
import { LotController } from './lot.controller';
import { MixingService } from './electrode/mixing.service';
import { CoatingService } from './electrode/coating.service';
import { PressService } from './electrode/press.service';
import { NotchingService } from './electrode/notching.service';
import { StackingService } from './assembly/stacking.service';
import { WeldingService } from './assembly/welding.service';
import { LotMixing } from '../../../common/entities/lots/lot-01-mixing.entity';
import { LotCoating } from '../../../common/entities/lots/lot-02-coating.entity';
import { LotPress } from '../../../common/entities/lots/lot-03-press.entity';
import { LotNotching } from '../../../common/entities/lots/lot-04-notching.entity';
import { LotStacking } from '../../../common/entities/lots/lot-05-stacking.entity';
import { LotWelding } from '../../../common/entities/lots/lot-06-welding.entity';
import { LotSync } from '../../../common/entities/lots/lot-sync.entity';
import { WorklogBinder } from '../../../common/entities/worklogs/worklog-01-binder.entity';
import { WorklogSlurry } from '../../../common/entities/worklogs/worklog-02-slurry.entity';
import { WorklogCoating } from '../../../common/entities/worklogs/worklog-03-coating.entity';
import { WorklogPress } from '../../../common/entities/worklogs/worklog-04-press.entity';
import { WorklogNotching } from '../../../common/entities/worklogs/worklog-06-notching.entity';
import { WorklogStacking } from '../../../common/entities/worklogs/worklog-09-stacking.entity';
import { WorklogWelding } from '../../../common/entities/worklogs/worklog-10-welding.entity';
import { Material } from '../../../common/entities/material.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LotMixing,
      LotCoating,
      LotPress,
      LotNotching,
      LotStacking,
      LotWelding,
      LotSync,
      Material,
      WorklogBinder,
      WorklogSlurry,
      WorklogCoating,
      WorklogPress,
      WorklogNotching,
      WorklogStacking,
      WorklogWelding,
    ]),
  ],
  controllers: [LotController],
  providers: [LotService, MixingService, CoatingService, PressService, NotchingService, StackingService, WeldingService],
})
export class LotModule {}
