import { Module } from '@nestjs/common';
import { OqcService } from './oqc.service';
import { OqcController } from './oqc.controller';

@Module({
  controllers: [OqcController],
  providers: [OqcService],
})
export class OqcModule {}
