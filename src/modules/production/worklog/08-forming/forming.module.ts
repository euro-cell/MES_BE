import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FormingService } from './forming.service';
import { FormingController } from './forming.controller';
import { WorklogForming } from 'src/common/entities/worklogs/worklog-08-forming.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorklogForming])],
  controllers: [FormingController],
  providers: [FormingService],
})
export class FormingModule {}
