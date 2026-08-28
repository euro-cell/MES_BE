import { Module } from '@nestjs/common';
import { IqcProto2Service } from './iqc-proto2.service';
import { IqcProto2Controller } from './iqc-proto2.controller';
import { UniverCliModule } from '../shared/univer-cli.module';

@Module({
  imports: [UniverCliModule],
  controllers: [IqcProto2Controller],
  providers: [IqcProto2Service],
})
export class IqcProto2Module {}
