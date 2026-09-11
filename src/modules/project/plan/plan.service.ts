import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectPlan } from '../../../common/entities/project/project-plan.entity';
import { ProjectPlanItem } from '../../../common/entities/project/project-plan-item.entity';
import { Project } from '../../../common/entities/project/project.entity';
import { ProcessTemplate } from '../../../common/entities/project/process-template.entity';
import { Repository } from 'typeorm';
import { CreateProjectPlanDto, UpdateProjectPlanDto } from '../../../common/dtos/project/project-plan.dto';
import { PlanTransformerUtil } from '../../../common/utils/plan-transformer.util';

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(ProjectPlan)
    private readonly planRepository: Repository<ProjectPlan>,
    @InjectRepository(ProjectPlanItem)
    private readonly planItemRepository: Repository<ProjectPlanItem>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(ProcessTemplate)
    private readonly templateRepository: Repository<ProcessTemplate>,
  ) {}

  private buildItems(plan: ProjectPlan, processPlans: Record<string, { start: string; end: string }>): ProjectPlanItem[] {
    return Object.entries(processPlans || {})
      .filter(([, value]) => value?.start || value?.end)
      .map(([key, value]) =>
        this.planItemRepository.create({
          plan,
          key,
          startDate: value.start || value.end,
          endDate: value.end || value.start,
        }),
      );
  }

  private async resolveTemplate(templateId?: number): Promise<ProcessTemplate | null> {
    if (!templateId) return null;
    const template = await this.templateRepository.findOne({ where: { id: templateId } });
    if (!template) throw new NotFoundException('공정 템플릿을 찾을 수 없습니다.');
    return template;
  }

  async savePlan(projectId: number, dto: CreateProjectPlanDto) {
    const project = await this.projectRepository.findOne({ where: { id: projectId } });
    if (!project) throw new NotFoundException('프로젝트를 찾을 수 없습니다.');

    const template = await this.resolveTemplate(dto.templateId);

    let plan = await this.planRepository.findOne({ where: { project: { id: projectId } } });

    if (plan) {
      await this.planItemRepository.delete({ plan: { id: plan.id } });
    } else {
      plan = this.planRepository.create({ project });
    }

    plan.startDate = dto.startDate;
    plan.endDate = dto.endDate;
    plan.template = template;
    plan = await this.planRepository.save(plan);

    plan.items = this.buildItems(plan, dto.processPlans);
    if (plan.items.length) await this.planItemRepository.save(plan.items);

    return plan;
  }

  async searchPlans(filters: { projectId?: number }) {
    const { projectId } = filters;
    if (!projectId) return [];

    const plans = await this.planRepository.find({
      where: { project: { id: projectId } },
      relations: ['project', 'template', 'template.items', 'items'],
      order: { startDate: 'ASC' },
    });
    return plans.map((plan) => PlanTransformerUtil.transformPlanData(plan));
  }

  async updatePlan(projectId: number, dto: UpdateProjectPlanDto) {
    const plan = await this.planRepository.findOne({ where: { project: { id: projectId } } });
    if (!plan) throw new NotFoundException('등록된 생산계획이 없습니다.');

    if (dto.templateId !== undefined) {
      plan.template = await this.resolveTemplate(dto.templateId);
    }
    if (dto.startDate !== undefined) plan.startDate = dto.startDate;
    if (dto.endDate !== undefined) plan.endDate = dto.endDate;

    await this.planRepository.save(plan);

    if (dto.processPlans) {
      await this.planItemRepository.delete({ plan: { id: plan.id } });
      const items = this.buildItems(plan, dto.processPlans);
      if (items.length) await this.planItemRepository.save(items);
    }

    return plan;
  }

  async deletePlan(projectId: number) {
    const plan = await this.planRepository.findOne({ where: { project: { id: projectId } } });
    if (!plan) {
      throw new NotFoundException('해당 생산에 등록된 계획이 없습니다.');
    }
    return await this.planRepository.delete(plan.id);
  }
}
