import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorklogService } from './worklog.service';
import { WorklogController } from './worklog.controller';
import { BinderModule, SlurryModule, CoatingModule, PressModule, NotchingModule, VdModule, FormingModule, StackingModule, WeldingModule, SealingModule, FillingModule, FormationModule, GradingModule, VisualInspectionModule } from './index';

// Worklog Entities
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
import { WorklogGrading } from 'src/common/entities/worklogs/worklog-14-grading.entity';
import { WorklogVisualInspection } from 'src/common/entities/worklogs/worklog-15-visual-inspection.entity';

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
    ]),
    RouterModule.register([
      { path: 'production', module: BinderModule },
      { path: 'production', module: SlurryModule },
      { path: 'production', module: CoatingModule },
      { path: 'production', module: PressModule },
      { path: 'production', module: NotchingModule },
      { path: 'production', module: VdModule },
      { path: 'production', module: FormingModule },
      { path: 'production', module: StackingModule },
      { path: 'production', module: WeldingModule },
      { path: 'production', module: SealingModule },
      { path: 'production', module: FillingModule },
      { path: 'production', module: FormationModule },
      { path: 'production', module: GradingModule },
      { path: 'production', module: VisualInspectionModule },
    ]),
    BinderModule,
    SlurryModule,
    CoatingModule,
    PressModule,
    NotchingModule,
    VdModule,
    FormingModule,
    StackingModule,
    WeldingModule,
    SealingModule,
    FillingModule,
    FormationModule,
    GradingModule,
    VisualInspectionModule,
  ],
  controllers: [WorklogController],
  providers: [WorklogService],
})
export class WorklogModule {}
