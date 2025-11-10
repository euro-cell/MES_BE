import { Module } from '@nestjs/common';
import { ProductMaterialService } from './material.service';
import { ProductMaterialController } from './material.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Production } from 'src/common/entities/production.entity';
import { ProductionMaterial } from 'src/common/entities/production-material.entity';
import { Material } from 'src/common/entities/material.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Production, ProductionMaterial, Material])],
  controllers: [ProductMaterialController],
  providers: [ProductMaterialService],
})
export class ProductMaterialModule {}
