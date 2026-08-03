import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorklogBinder } from '../../../../common/entities/worklog/worklog-01-binder.entity';
import { WorklogSlurry } from '../../../../common/entities/worklog/worklog-02-slurry.entity';
import { WorklogCoating } from '../../../../common/entities/worklog/worklog-03-coating.entity';
import { WorklogPress } from '../../../../common/entities/worklog/worklog-04-press.entity';
import { WorklogNotching } from '../../../../common/entities/worklog/worklog-06-notching.entity';
import { WorklogVd } from '../../../../common/entities/worklog/worklog-07-vd.entity';
import { WorklogForming } from '../../../../common/entities/worklog/worklog-08-forming.entity';
import { WorklogStacking } from '../../../../common/entities/worklog/worklog-09-stacking.entity';
import { WorklogWelding } from '../../../../common/entities/worklog/worklog-10-welding.entity';
import { WorklogSealing } from '../../../../common/entities/worklog/worklog-11-sealing.entity';
import { WorklogFilling } from '../../../../common/entities/worklog/worklog-12-filling.entity';
import { WorklogFormation } from '../../../../common/entities/worklog/worklog-13-formation.entity';
import { WorklogGrading } from '../../../../common/entities/worklog/worklog-14-grading.entity';
import { WorklogVisualInspection } from '../../../../common/entities/worklog/worklog-15-visual-inspection.entity';
import { Material } from '../../../../common/entities/material/material.entity';
import { ProjectPlan } from '../../../../common/entities/project/project-plan.entity';
import { ProjectTarget } from '../../../../common/entities/project/project-target.entity';
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
  GradingProcessService,
  VisualInspectionProcessService,
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
      WorklogGrading,
      WorklogVisualInspection,
      Material,
      ProjectPlan,
      ProjectTarget,
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
    GradingProcessService,
    VisualInspectionProcessService,
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
    GradingProcessService,
    VisualInspectionProcessService,
  ],
})
export class ProcessModule {}
