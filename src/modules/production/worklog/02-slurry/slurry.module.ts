import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlurryService } from './slurry.service';
import { SlurryController } from './slurry.controller';
import { WorklogSlurry } from 'src/common/entities/worklogs/worklog-02-slurry.entity';
import { MaterialModule } from 'src/modules/material/material.module';

@Module({
  imports: [TypeOrmModule.forFeature([WorklogSlurry]), MaterialModule],
  controllers: [SlurryController],
  providers: [SlurryService],
})
export class SlurryModule {}
