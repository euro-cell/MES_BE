import { Module } from '@nestjs/common';
import { SpecificationService } from './specification.service';
import { SpecificationController } from './specification.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Specification } from 'src/common/entities/specification.entity';
import { Production } from 'src/common/entities/production.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Specification, Production])],
  controllers: [SpecificationController],
  providers: [SpecificationService],
})
export class SpecificationModule {}
