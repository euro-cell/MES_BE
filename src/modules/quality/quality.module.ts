import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { LqcModule } from './lqc/lqc.module';
import { OqcModule } from './oqc/oqc.module';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'quality',
        children: [
          { path: 'lqc', module: LqcModule },
          { path: 'oqc', module: OqcModule },
        ],
      },
    ]),
    LqcModule,
    OqcModule,
  ],
})
export class QualityModule {}
