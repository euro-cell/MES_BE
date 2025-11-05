import { Module } from '@nestjs/common';
import { ProductMaterialService } from './material.service';
import { ProductMaterialController } from './material.controller';

@Module({
  controllers: [ProductMaterialController],
  providers: [ProductMaterialService],
})
export class ProductMaterialModule {}
