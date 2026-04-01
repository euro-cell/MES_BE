import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LqcController } from './lqc.controller';
import { LqcService } from './lqc.service';
import { LqcSpec } from 'src/common/entities/specification/lqc-spec.entity';
import { WorklogBinder } from 'src/common/entities/worklog/worklog-01-binder.entity';
import { WorklogSlurry } from 'src/common/entities/worklog/worklog-02-slurry.entity';
import { WorklogCoating } from 'src/common/entities/worklog/worklog-03-coating.entity';
import { WorklogPress } from 'src/common/entities/worklog/worklog-04-press.entity';
import { WorklogVd } from 'src/common/entities/worklog/worklog-07-vd.entity';
import { WorklogSealing } from 'src/common/entities/worklog/worklog-11-sealing.entity';
import { WorklogFormation } from 'src/common/entities/worklog/worklog-13-formation.entity';
import { LotFormation } from 'src/common/entities/lot/lot-08-formation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LqcSpec, WorklogBinder, WorklogSlurry, WorklogCoating, WorklogPress, WorklogVd, WorklogSealing, WorklogFormation, LotFormation])],
  controllers: [LqcController],
  providers: [LqcService],
})
export class LqcModule {}
