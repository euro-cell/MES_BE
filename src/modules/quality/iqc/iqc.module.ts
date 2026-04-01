import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IqcService } from './iqc.service';
import { IqcController } from './iqc.controller';
import { IQC } from 'src/common/entities/quality/iqc.entity';
import { IQCResult } from 'src/common/entities/quality/iqc-result.entity';
import { IQCCoaRef } from 'src/common/entities/quality/iqc-coa-ref.entity';
import { IQCImage } from 'src/common/entities/quality/iqc-image.entity';
import { IQCFile } from 'src/common/entities/quality/iqc-file.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([IQC, IQCResult, IQCCoaRef, IQCImage, IQCFile]),
  ],
  controllers: [IqcController],
  providers: [IqcService],
  exports: [IqcService],
})
export class IqcModule {}
