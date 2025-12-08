import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BinderService } from './binder.service';
import { BinderController } from './binder.controller';
import { WorklogBinder } from 'src/common/entities/worklogs/worklog-binder.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorklogBinder])],
  controllers: [BinderController],
  providers: [BinderService],
})
export class BinderModule {}
