import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VisualInspectionService } from './visual-inspection.service';
import { VisualInspectionController } from './visual-inspection.controller';
import { WorklogVisualInspection } from 'src/common/entities/worklogs/worklog-15-visual-inspection.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorklogVisualInspection])],
  controllers: [VisualInspectionController],
  providers: [VisualInspectionService],
})
export class VisualInspectionModule {}
