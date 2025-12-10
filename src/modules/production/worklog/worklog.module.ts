import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { WorklogService } from './worklog.service';
import { WorklogController } from './worklog.controller';
import { BinderModule } from './01-binder/binder.module';
import { SlurryModule } from './02-slurry/slurry.module';

@Module({
  imports: [
    RouterModule.register([
      { path: 'production', module: BinderModule },
      { path: 'production', module: SlurryModule },
    ]),
    BinderModule,
    SlurryModule,
  ],
  controllers: [WorklogController],
  providers: [WorklogService],
})
export class WorklogModule {}
