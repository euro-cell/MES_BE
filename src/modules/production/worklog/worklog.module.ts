import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { WorklogService } from './worklog.service';
import { WorklogController } from './worklog.controller';
import { BinderModule, SlurryModule, CoatingModule, PressModule, NotchingModule, VdModule, FormingModule, StackingModule, WeldingModule, SealingModule } from './index';

@Module({
  imports: [
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
  ],
  controllers: [WorklogController],
  providers: [WorklogService],
})
export class WorklogModule {}
