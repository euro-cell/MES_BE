import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcessTemplateService } from './process-template.service';
import { ProcessTemplateController } from './process-template.controller';
import { ProcessTemplate } from '../../common/entities/project/process-template.entity';
import { ProcessTemplateItem } from '../../common/entities/project/process-template-item.entity';
import { ProjectPlan } from '../../common/entities/project/project-plan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProcessTemplate, ProcessTemplateItem, ProjectPlan])],
  controllers: [ProcessTemplateController],
  providers: [ProcessTemplateService],
  exports: [ProcessTemplateService],
})
export class ProcessTemplateModule {}
