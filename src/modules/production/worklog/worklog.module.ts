import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { WorklogService } from './worklog.service';
import { WorklogController } from './worklog.controller';
import { BinderModule } from './binder/binder.module';

@Module({
  imports: [RouterModule.register([{ path: 'production', module: BinderModule }]), BinderModule],
  controllers: [WorklogController],
  providers: [WorklogService],
})
export class WorklogModule {}
