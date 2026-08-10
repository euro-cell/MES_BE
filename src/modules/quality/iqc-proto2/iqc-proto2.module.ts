import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { json } from 'express';
import { IqcProto2Service } from './iqc-proto2.service';
import { IqcProto2Controller } from './iqc-proto2.controller';
import { IqcProto2Workbook } from '../../../common/entities/quality/iqc-proto2-workbook.entity';
import { UniverCliModule } from '../shared/univer-cli.module';

@Module({
  imports: [TypeOrmModule.forFeature([IqcProto2Workbook]), UniverCliModule],
  controllers: [IqcProto2Controller],
  providers: [IqcProto2Service],
})
export class IqcProto2Module implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(json({ limit: '50mb' })).forRoutes(IqcProto2Controller);
  }
}
