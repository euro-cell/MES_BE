import { Module } from '@nestjs/common';
import { ProductSpecificationService } from './specification.service';
import { ProductSpecificationController } from './specification.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from 'src/common/entities/project/project.entity';
import { ProjectSpecification } from 'src/common/entities/project/project-specifications.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Project, ProjectSpecification])],
  controllers: [ProductSpecificationController],
  providers: [ProductSpecificationService],
})
export class ProductSpecificationModule {}
