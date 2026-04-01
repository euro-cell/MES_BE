import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorklogService } from './worklog.service';
import { WorklogController } from './worklog.controller';
import { BinderModule, SlurryModule, CoatingModule, PressModule, NotchingModule, VdModule, FormingModule, StackingModule, WeldingModule, SealingModule, FillingModule, FormationModule, GradingModule, VisualInspectionModule } from './index';

// Worklog Entities
import { WorklogBinder } from 'src/common/entities/worklog/worklog-01-binder.entity';
import { WorklogSlurry } from 'src/common/entities/worklog/worklog-02-slurry.entity';
import { WorklogCoating } from 'src/common/entities/worklog/worklog-03-coating.entity';
import { WorklogPress } from 'src/common/entities/worklog/worklog-04-press.entity';
import { WorklogNotching } from 'src/common/entities/worklog/worklog-06-notching.entity';
import { WorklogVd } from 'src/common/entities/worklog/worklog-07-vd.entity';
import { WorklogForming } from 'src/common/entities/worklog/worklog-08-forming.entity';
import { WorklogStacking } from 'src/common/entities/worklog/worklog-09-stacking.entity';
import { WorklogWelding } from 'src/common/entities/worklog/worklog-10-welding.entity';
import { WorklogSealing } from 'src/common/entities/worklog/worklog-11-sealing.entity';
import { WorklogFilling } from 'src/common/entities/worklog/worklog-12-filling.entity';
import { WorklogFormation } from 'src/common/entities/worklog/worklog-13-formation.entity';
import { WorklogGrading } from 'src/common/entities/worklog/worklog-14-grading.entity';
import { WorklogVisualInspection } from 'src/common/entities/worklog/worklog-15-visual-inspection.entity';

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
      { path: 'project', module: BinderModule },
      { path: 'project', module: SlurryModule },
      { path: 'project', module: CoatingModule },
      { path: 'project', module: PressModule },
      { path: 'project', module: NotchingModule },
      { path: 'project', module: VdModule },
      { path: 'project', module: FormingModule },
      { path: 'project', module: StackingModule },
      { path: 'project', module: WeldingModule },
      { path: 'project', module: SealingModule },
      { path: 'project', module: FillingModule },
      { path: 'project', module: FormationModule },
      { path: 'project', module: GradingModule },
      { path: 'project', module: VisualInspectionModule },
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
