import { Module } from '@nestjs/common';
import { IqcService } from './iqc.service';
import { IqcController } from './iqc.controller';

@Module({
  controllers: [IqcController],
  providers: [IqcService],
})
export class IqcModule {}
