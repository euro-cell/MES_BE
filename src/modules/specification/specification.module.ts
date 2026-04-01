import { Module } from '@nestjs/common';
import { SpecificationService } from './specification.service';
import { SpecificationController } from './specification.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Specification } from 'src/common/entities/specification/specification.entity';
import { Project } from 'src/common/entities/project/project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Specification, Project])],
  controllers: [SpecificationController],
  providers: [SpecificationService],
})
export class SpecificationModule {}
