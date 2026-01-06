import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoatingService } from './coating.service';
import { CoatingController } from './coating.controller';
import { WorklogCoating } from 'src/common/entities/worklogs/worklog-03-coating.entity';
import { MaterialModule } from 'src/modules/material/material.module';

@Module({
  imports: [TypeOrmModule.forFeature([WorklogCoating]), MaterialModule],
  controllers: [CoatingController],
  providers: [CoatingService],
})
export class CoatingModule {}
