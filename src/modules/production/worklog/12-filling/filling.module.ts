import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FillingService } from './filling.service';
import { FillingController } from './filling.controller';
import { WorklogFilling } from 'src/common/entities/worklogs/worklog-12-filling.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorklogFilling])],
  controllers: [FillingController],
  providers: [FillingService],
})
export class FillingModule {}
