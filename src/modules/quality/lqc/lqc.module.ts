import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LqcController } from './lqc.controller';
import { LqcService } from './lqc.service';
import { LqcSpec } from '../../../common/entities/specification/lqc-spec.entity';
import { WorklogBinder } from '../../../common/entities/worklog/worklog-01-binder.entity';
import { WorklogSlurry } from '../../../common/entities/worklog/worklog-02-slurry.entity';
import { WorklogCoating } from '../../../common/entities/worklog/worklog-03-coating.entity';
import { WorklogPress } from '../../../common/entities/worklog/worklog-04-press.entity';
import { WorklogVd } from '../../../common/entities/worklog/worklog-07-vd.entity';
import { WorklogSealing } from '../../../common/entities/worklog/worklog-11-sealing.entity';
import { WorklogFormation } from '../../../common/entities/worklog/worklog-13-formation.entity';
import { LotFormation } from '../../../common/entities/lot/lot-08-formation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LqcSpec, WorklogBinder, WorklogSlurry, WorklogCoating, WorklogPress, WorklogVd, WorklogSealing, WorklogFormation, LotFormation])],
  controllers: [LqcController],
  providers: [LqcService],
})
export class LqcModule {}
