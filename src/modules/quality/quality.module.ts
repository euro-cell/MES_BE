import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { LqcModule } from './lqc/lqc.module';
import { OqcModule } from './oqc/oqc.module';
import { IqcModule } from './iqc/iqc.module';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'quality',
        children: [
          { path: 'iqc', module: IqcModule },
          { path: 'lqc', module: LqcModule },
          { path: 'oqc', module: OqcModule },
        ],
      },
    ]),
    IqcModule,
    LqcModule,
    OqcModule,
  ],
})
export class QualityModule {}
