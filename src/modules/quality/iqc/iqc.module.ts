import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { json } from 'express';
import { IqcService } from './iqc.service';
import { IqcController } from './iqc.controller';
import { IqcWorkbookService } from './iqc-workbook.service';
import { IqcWorkbookController } from './iqc-workbook.controller';
import { IQC } from '../../../common/entities/quality/iqc.entity';
import { IQCResult } from '../../../common/entities/quality/iqc-result.entity';
import { IQCCoaRef } from '../../../common/entities/quality/iqc-coa-ref.entity';
import { IQCImage } from '../../../common/entities/quality/iqc-image.entity';
import { IQCFile } from '../../../common/entities/quality/iqc-file.entity';
import { IQCSummary } from '../../../common/entities/quality/iqc-summary.entity';
import { IqcWorkbook } from '../../../common/entities/quality/iqc-workbook.entity';
import { UniverCliModule } from '../shared/univer-cli.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([IQC, IQCResult, IQCCoaRef, IQCImage, IQCFile, IQCSummary, IqcWorkbook]),
    UniverCliModule,
  ],
  controllers: [IqcController, IqcWorkbookController],
  providers: [IqcService, IqcWorkbookService],
  exports: [IqcService],
})
export class IqcModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(json({ limit: '50mb' })).forRoutes(IqcWorkbookController);
  }
}
