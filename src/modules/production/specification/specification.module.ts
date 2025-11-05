import { Module } from '@nestjs/common';
import { ProductSpecificationService } from './specification.service';
import { ProductSpecificationController } from './specification.controller';

@Module({
  controllers: [ProductSpecificationController],
  providers: [ProductSpecificationService],
})
export class ProductSpecificationModule {}
