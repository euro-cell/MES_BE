import { Module } from '@nestjs/common';
import { LqcController } from './lqc.controller';
import { LqcService } from './lqc.service';

@Module({
  controllers: [LqcController],
  providers: [LqcService]
})
export class LqcModule {}
