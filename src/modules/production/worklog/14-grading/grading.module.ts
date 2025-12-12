import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradingService } from './grading.service';
import { GradingController } from './grading.controller';
import { WorklogGrading } from 'src/common/entities/worklogs/worklog-14-grading.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorklogGrading])],
  controllers: [GradingController],
  providers: [GradingService],
})
export class GradingModule {}
