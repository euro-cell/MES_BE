import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StackingService } from './stacking.service';
import { StackingController } from './stacking.controller';
import { WorklogStacking } from 'src/common/entities/worklogs/worklog-09-stacking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorklogStacking])],
  controllers: [StackingController],
  providers: [StackingService],
})
export class StackingModule {}
