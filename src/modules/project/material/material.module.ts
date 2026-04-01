import { Module } from '@nestjs/common';
import { ProductMaterialService } from './material.service';
import { ProductMaterialController } from './material.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from 'src/common/entities/project/project.entity';
import { ProjectMaterial } from 'src/common/entities/project/project-material.entity';
import { Material } from 'src/common/entities/material/material.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Project, ProjectMaterial, Material])],
  controllers: [ProductMaterialController],
  providers: [ProductMaterialService],
})
export class ProductMaterialModule {}
