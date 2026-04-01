import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectPlan } from '../../../common/entities/project/project-plan.entity';
import { Project } from '../../../common/entities/project/project.entity';
import { Repository } from 'typeorm';
import { CreateProjectPlanDto, UpdateProjectPlanDto } from 'src/common/dtos/project/project-plan.dto';
import { PROJECT_PLAN_MAPPING } from 'src/common/utils/plan-transformer.util';
import { PlanTransformerUtil } from 'src/common/utils/plan-transformer.util';

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(ProjectPlan)
    private readonly planRepository: Repository<ProjectPlan>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async savePlan(projectId: number, dto: CreateProjectPlanDto) {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('프로젝트를 찾을 수 없습니다.');

    const { startDate, endDate, processPlans } = dto;

    const planData: Partial<Record<keyof ProjectPlan, any>> = {
      project,
      startDate,
      endDate,
    };

    for (const [key, value] of Object.entries(processPlans)) {
      const field = PROJECT_PLAN_MAPPING[key];
      if (!field) {
        console.warn(`⚠️ 매칭되지 않은 공정명: ${key}`);
        continue;
      }
      const { start, end } = value;

      let dateValue = '';
      if (start && end) dateValue = `${start}~${end}`;
      else if (start) dateValue = start;
      else if (end) dateValue = end;
      else continue;

      planData[field] = dateValue;
    }

    let plan = await this.planRepository.findOne({
      where: { project: { id: projectId } },
    });

    if (plan) {
      Object.assign(plan, planData);
    } else {
      plan = this.planRepository.create(planData);
    }
    return await this.planRepository.save(plan);
  }

  async searchPlans(filters: { projectId?: number }) {
    const { projectId } = filters;
    if (!projectId) return [];

    const plans = await this.planRepository.find({
      where: { project: { id: projectId } },
      relations: ['project'],
      order: { startDate: 'ASC' },
    });
    return plans.map((plan) => PlanTransformerUtil.transformPlanData(plan));
  }

  async updatePlan(projectId: number, dto: UpdateProjectPlanDto) {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('프로젝트를 찾을 수 없습니다.');

    const plan = await this.planRepository.findOne({
      where: { project: { id: projectId } },
    });

    if (!plan) throw new NotFoundException('등록된 생산계획이 없습니다.');

    const { startDate, endDate, processPlans } = dto;

    const updateData: Partial<Record<keyof ProjectPlan, any>> = {
      startDate,
      endDate,
    };

    for (const [key, value] of Object.entries(processPlans || {})) {
      const field = PROJECT_PLAN_MAPPING[key];
      if (!field) continue;

      const { start, end } = value;

      let dateValue = '';
      if (start && end) dateValue = `${start}~${end}`;
      else if (start) dateValue = start;
      else if (end) dateValue = end;
      else continue;

      updateData[field] = dateValue;
    }

    Object.assign(plan, updateData);

    return await this.planRepository.save(plan);
  }

  async deletePlan(projectId: number) {
    const plan = await this.planRepository.findOne({ where: { project: { id: projectId } } });
    if (!plan) {
      throw new NotFoundException('해당 생산에 등록된 계획이 없습니다.');
    }
    return await this.planRepository.delete(plan.id);
  }
}
