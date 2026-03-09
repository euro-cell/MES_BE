import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IqcService } from './iqc.service';
import { IqcController } from './iqc.controller';
import { IQC } from 'src/common/entities/iqc.entity';
import { IQCResult } from 'src/common/entities/iqc-result.entity';
import { IQCCoaRef } from 'src/common/entities/iqc-coa-ref.entity';
import { IQCImage } from 'src/common/entities/iqc-image.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([IQC, IQCResult, IQCCoaRef, IQCImage]),
  ],
  controllers: [IqcController],
  providers: [IqcService],
  exports: [IqcService],
})
export class IqcModule {}
