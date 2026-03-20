import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OqcService } from './oqc.service';
import { OqcController } from './oqc.controller';
import { LotFormation } from 'src/common/entities/lots/lot-08-formation.entity';
import { OqcSpec } from 'src/common/entities/oqc-spec.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LotFormation, OqcSpec])],
  controllers: [OqcController],
  providers: [OqcService],
})
export class OqcModule {}
