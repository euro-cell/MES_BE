import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { json } from 'express';
import { IqcProtoService } from './iqc-proto.service';
import { IqcProtoController } from './iqc-proto.controller';

@Module({
  controllers: [IqcProtoController],
  providers: [IqcProtoService],
})
export class IqcProtoModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(json({ limit: '50mb' })).forRoutes(IqcProtoController);
  }
}
