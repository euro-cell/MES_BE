import { Module } from '@nestjs/common';
import { LqcModule } from './lqc/lqc.module';
import { OqcModule } from './oqc/oqc.module';

@Module({
  imports: [LqcModule, OqcModule]
})
export class QualityModule {}
