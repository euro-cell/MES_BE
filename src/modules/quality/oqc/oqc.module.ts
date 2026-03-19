import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OqcService } from './oqc.service';
import { OqcController } from './oqc.controller';
import { LotFormation } from 'src/common/entities/lots/lot-08-formation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LotFormation])],
  controllers: [OqcController],
  providers: [OqcService],
})
export class OqcModule {}
