import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoatingService } from './coating.service';
import { CoatingController } from './coating.controller';
import { WorklogCoating } from 'src/common/entities/worklogs/worklog-03-coating.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorklogCoating])],
  controllers: [CoatingController],
  providers: [CoatingService],
})
export class CoatingModule {}
