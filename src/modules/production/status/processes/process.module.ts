import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorklogBinder } from 'src/common/entities/worklogs/worklog-01-binder.entity';
import { WorklogSlurry } from 'src/common/entities/worklogs/worklog-02-slurry.entity';
import { WorklogCoating } from 'src/common/entities/worklogs/worklog-03-coating.entity';
import { WorklogPress } from 'src/common/entities/worklogs/worklog-04-press.entity';
import { WorklogNotching } from 'src/common/entities/worklogs/worklog-06-notching.entity';
import { Material } from 'src/common/entities/material.entity';
import { ProductionPlan } from 'src/common/entities/production-plan.entity';
import { ProductionTarget } from 'src/common/entities/production-target.entity';
import {
  MixingProcessService,
  CoatingProcessService,
  PressProcessService,
  NotchingProcessService,
} from '.';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorklogBinder,
      WorklogSlurry,
      WorklogCoating,
      WorklogPress,
      WorklogNotching,
      Material,
      ProductionPlan,
      ProductionTarget,
    ]),
  ],
  providers: [
    MixingProcessService,
    CoatingProcessService,
    PressProcessService,
    NotchingProcessService,
  ],
  exports: [
    MixingProcessService,
    CoatingProcessService,
    PressProcessService,
    NotchingProcessService,
  ],
})
export class ProcessModule {}
