import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LqcController } from './lqc.controller';
import { LqcService } from './lqc.service';
import { LqcSpec } from 'src/common/entities/lqc-spec.entity';
import { WorklogBinder } from 'src/common/entities/worklogs/worklog-01-binder.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LqcSpec, WorklogBinder])],
  controllers: [LqcController],
  providers: [LqcService],
})
export class LqcModule {}
