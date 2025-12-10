import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { WorklogService } from './worklog.service';
import { WorklogController } from './worklog.controller';
import { BinderModule, SlurryModule, CoatingModule } from './index';

@Module({
  imports: [
    RouterModule.register([
      { path: 'production', module: BinderModule },
      { path: 'production', module: SlurryModule },
      { path: 'production', module: CoatingModule },
    ]),
    BinderModule,
    SlurryModule,
    CoatingModule,
  ],
  controllers: [WorklogController],
  providers: [WorklogService],
})
export class WorklogModule {}
