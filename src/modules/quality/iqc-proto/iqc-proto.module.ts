import { Module } from '@nestjs/common';
import { IqcProtoService } from './iqc-proto.service';
import { IqcProtoController } from './iqc-proto.controller';

@Module({
  controllers: [IqcProtoController],
  providers: [IqcProtoService],
})
export class IqcProtoModule {}
