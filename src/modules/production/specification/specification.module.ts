import { Module } from '@nestjs/common';
import { ProductSpecificationService } from './specification.service';
import { ProductSpecificationController } from './specification.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Production } from 'src/common/entities/production.entity';
import { ProductionSpecification } from 'src/common/entities/production-specifications.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Production, ProductionSpecification])],
  controllers: [ProductSpecificationController],
  providers: [ProductSpecificationService],
})
export class ProductSpecificationModule {}
