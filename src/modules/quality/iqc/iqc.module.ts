import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IqcService } from './iqc.service';
import { IqcController } from './iqc.controller';
import { IQCSummary } from 'src/common/entities/iqc-summary.entity';
import { IQCListItem } from 'src/common/entities/iqc-list-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IQCSummary, IQCListItem])],
  controllers: [IqcController],
  providers: [IqcService],
  exports: [IqcService],
})
export class IqcModule {}
