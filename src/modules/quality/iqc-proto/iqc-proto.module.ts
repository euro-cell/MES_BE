import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { json } from 'express';
import { IqcProtoService } from './iqc-proto.service';
import { IqcProtoController } from './iqc-proto.controller';
import { IqcProtoWorkbook } from '../../../common/entities/quality/iqc-proto-workbook.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IqcProtoWorkbook])],
  controllers: [IqcProtoController],
  providers: [IqcProtoService],
})
export class IqcProtoModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(json({ limit: '50mb' })).forRoutes(IqcProtoController);
  }
}
