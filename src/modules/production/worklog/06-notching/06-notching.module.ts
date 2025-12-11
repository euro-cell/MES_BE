import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotchingController } from './06-notching.controller';
import { NotchingService } from './06-notching.service';
import { WorklogNotching } from 'src/common/entities/worklogs/worklog-06-notching.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorklogNotching])],
  controllers: [NotchingController],
  providers: [NotchingService],
})
export class NotchingModule {}
