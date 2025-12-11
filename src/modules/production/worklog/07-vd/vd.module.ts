import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VdService } from './vd.service';
import { VdController } from './vd.controller';
import { WorklogVd } from 'src/common/entities/worklogs/worklog-07-vd.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorklogVd])],
  controllers: [VdController],
  providers: [VdService],
})
export class VdModule {}
