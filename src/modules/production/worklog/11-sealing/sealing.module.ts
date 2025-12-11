import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SealingService } from './sealing.service';
import { SealingController } from './sealing.controller';
import { WorklogSealing } from 'src/common/entities/worklogs/worklog-11-sealing.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorklogSealing])],
  controllers: [SealingController],
  providers: [SealingService],
})
export class SealingModule {}
