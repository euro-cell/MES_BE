import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LqcController } from './lqc.controller';
import { LqcService } from './lqc.service';
import { LqcSpec } from 'src/common/entities/lqc-spec.entity';
import { WorklogBinder } from 'src/common/entities/worklogs/worklog-01-binder.entity';
import { WorklogSlurry } from 'src/common/entities/worklogs/worklog-02-slurry.entity';
import { WorklogCoating } from 'src/common/entities/worklogs/worklog-03-coating.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LqcSpec, WorklogBinder, WorklogSlurry, WorklogCoating])],
  controllers: [LqcController],
  providers: [LqcService],
})
export class LqcModule {}
