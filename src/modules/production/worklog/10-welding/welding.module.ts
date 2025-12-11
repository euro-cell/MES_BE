import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WeldingService } from './welding.service';
import { WeldingController } from './welding.controller';
import { WorklogWelding } from 'src/common/entities/worklogs/worklog-10-welding.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorklogWelding])],
  controllers: [WeldingController],
  providers: [WeldingService],
})
export class WeldingModule {}
