import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IqcService } from './iqc.service';
import { IqcController } from './iqc.controller';
import { IQCSummary } from 'src/common/entities/iqc-summary.entity';
import { IQCListItem } from 'src/common/entities/iqc-list-item.entity';
import { IQCCathodeMaterial1 } from 'src/common/entities/iqc-cathode-material-1.entity';
import { IQCCathodeMaterial1Result } from 'src/common/entities/iqc-cathode-material-1-result.entity';
import { IQCCathodeMaterial1Image } from 'src/common/entities/iqc-cathode-material-1-image.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IQCSummary,
      IQCListItem,
      IQCCathodeMaterial1,
      IQCCathodeMaterial1Result,
      IQCCathodeMaterial1Image,
    ]),
  ],
  controllers: [IqcController],
  providers: [IqcService],
  exports: [IqcService],
})
export class IqcModule {}
