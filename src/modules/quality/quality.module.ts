import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { LqcModule } from './lqc/lqc.module';
import { OqcModule } from './oqc/oqc.module';
import { IqcModule } from './iqc/iqc.module';
import { IqcProtoModule } from './iqc-proto/iqc-proto.module';
import { IqcProto2Module } from './iqc-proto2/iqc-proto2.module';
import { IqcProto3Module } from './iqc-proto3/iqc-proto3.module';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'quality',
        children: [
          { path: 'iqc', module: IqcModule },
          { path: 'lqc', module: LqcModule },
          { path: 'oqc', module: OqcModule },
          { path: 'iqc-proto', module: IqcProtoModule },
          { path: 'iqc-proto2', module: IqcProto2Module },
          { path: 'iqc-proto3', module: IqcProto3Module },
        ],
      },
    ]),
    IqcModule,
    LqcModule,
    OqcModule,
    IqcProtoModule,
    IqcProto2Module,
    IqcProto3Module,
  ],
})
export class QualityModule {}
