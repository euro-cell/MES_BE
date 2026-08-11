import { Module } from '@nestjs/common';
import { IqcProto3Service } from './iqc-proto3.service';
import { IqcProto3Controller } from './iqc-proto3.controller';
import { UniverCliModule } from '../shared/univer-cli.module';

@Module({
  imports: [UniverCliModule],
  controllers: [IqcProto3Controller],
  providers: [IqcProto3Service],
})
export class IqcProto3Module {}
