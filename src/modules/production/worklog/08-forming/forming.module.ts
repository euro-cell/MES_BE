import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FormingService } from './forming.service';
import { FormingController } from './forming.controller';
import { WorklogForming } from 'src/common/entities/worklogs/worklog-08-forming.entity';
import { MaterialModule } from 'src/modules/material/material.module';

@Module({
  imports: [TypeOrmModule.forFeature([WorklogForming]), MaterialModule],
  controllers: [FormingController],
  providers: [FormingService],
})
export class FormingModule {}
