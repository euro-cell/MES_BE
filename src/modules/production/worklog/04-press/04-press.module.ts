import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PressController } from './04-press.controller';
import { PressService } from './04-press.service';
import { WorklogPress } from 'src/common/entities/worklogs/worklog-04-press.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorklogPress])],
  controllers: [PressController],
  providers: [PressService],
})
export class PressModule {}
