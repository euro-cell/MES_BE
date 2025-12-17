import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorklogBinder } from 'src/common/entities/worklogs/worklog-01-binder.entity';
import { WorklogSlurry } from 'src/common/entities/worklogs/worklog-02-slurry.entity';
import { WorklogCoating } from 'src/common/entities/worklogs/worklog-03-coating.entity';
import { WorklogPress } from 'src/common/entities/worklogs/worklog-04-press.entity';
import { WorklogNotching } from 'src/common/entities/worklogs/worklog-06-notching.entity';
import { WorklogVd } from 'src/common/entities/worklogs/worklog-07-vd.entity';
import { WorklogForming } from 'src/common/entities/worklogs/worklog-08-forming.entity';
import { WorklogStacking } from 'src/common/entities/worklogs/worklog-09-stacking.entity';
import { WorklogWelding } from 'src/common/entities/worklogs/worklog-10-welding.entity';
import { WorklogSealing } from 'src/common/entities/worklogs/worklog-11-sealing.entity';
import { WorklogFilling } from 'src/common/entities/worklogs/worklog-12-filling.entity';
import { WorklogFormation } from 'src/common/entities/worklogs/worklog-13-formation.entity';
import { Material } from 'src/common/entities/material.entity';
import { ProductionPlan } from 'src/common/entities/production-plan.entity';
import { ProductionTarget } from 'src/common/entities/production-target.entity';
import {
  MixingProcessService,
  CoatingProcessService,
  PressProcessService,
  SlittingProcessService,
  NotchingProcessService,
  VdProcessService,
  FormingProcessService,
  StackingProcessService,
  WeldingProcessService,
  SealingProcessService,
  FillingProcessService,
  FormationProcessService,
} from '.';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorklogBinder,
      WorklogSlurry,
      WorklogCoating,
      WorklogPress,
      WorklogNotching,
      WorklogVd,
      WorklogForming,
      WorklogStacking,
      WorklogWelding,
      WorklogSealing,
      WorklogFilling,
      WorklogFormation,
      Material,
      ProductionPlan,
      ProductionTarget,
    ]),
  ],
  providers: [
    MixingProcessService,
    CoatingProcessService,
    PressProcessService,
    SlittingProcessService,
    NotchingProcessService,
    VdProcessService,
    FormingProcessService,
    StackingProcessService,
    WeldingProcessService,
    SealingProcessService,
    FillingProcessService,
    FormationProcessService,
  ],
  exports: [
    MixingProcessService,
    CoatingProcessService,
    PressProcessService,
    SlittingProcessService,
    NotchingProcessService,
    VdProcessService,
    FormingProcessService,
    StackingProcessService,
    WeldingProcessService,
    SealingProcessService,
    FillingProcessService,
    FormationProcessService,
  ],
})
export class ProcessModule {}
