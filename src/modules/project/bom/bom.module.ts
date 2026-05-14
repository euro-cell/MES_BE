import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BomController } from './bom.controller';
import { BomService } from './bom.service';
import { BomTemplate } from 'src/common/entities/bom/bom-template.entity';
import { BomTemplateRow } from 'src/common/entities/bom/bom-template-row.entity';
import { Material } from 'src/common/entities/material/material.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BomTemplate, BomTemplateRow, Material])],
  controllers: [BomController],
  providers: [BomService],
})
export class BomModule {}
