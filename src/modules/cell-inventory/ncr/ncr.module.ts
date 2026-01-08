import { Module } from '@nestjs/common';
import { NcrService } from './ncr.service';
import { NcrController } from './ncr.controller';

@Module({
  controllers: [NcrController],
  providers: [NcrService],
})
export class NcrModule {}
