import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectPlan } from '../../../common/entities/project-plan.entity';
import { Project } from '../../../common/entities/project.entity';
import { Between, Like, Repository } from 'typeorm';

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(ProjectPlan)
    private readonly planRepository: Repository<ProjectPlan>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async savePlan(projectId: number, data: Record<string, string>) {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });
    if (!project) throw new Error('프로젝트를 찾을 수 없습니다.');

    let plan = await this.planRepository.findOne({
      where: { project: { id: projectId } },
    });
    if (!plan) {
      plan = new ProjectPlan();
      plan.project = project;
    }

    plan.startDate = data.startDate;
    plan.endDate = data.endDate;

    const processFields = [
      'mixing_cathode',
      'mixing_anode',
      'coating_cathode',
      'coating_anode',
      'calendering_cathode',
      'calendering_anode',
      'notching_cathode',
      'notching_anode',
      'pouch_forming',
      'vacuum_drying_cathode',
      'vacuum_drying_anode',
      'stacking',
      'tab_welding',
      'sealing',
      'el_filling',
      'pf_mf',
      'grading',
    ];

    for (const key of Object.keys(data)) {
      if (key === 'startDate' || key === 'endDate') continue;

      let normalizedKey = key
        .toLowerCase()
        .replace(/\//g, '_') // "pf/mf" → "pf_mf"
        .replace(/\s+/g, '_') // 공백 → _
        .replace(/^electrode_/, '') // 정확히 접두사 제거
        .replace(/^cell_assembly_/, '')
        .replace(/^cell_formation_/, '')
        .replace(/_+/g, '_'); // 중복 언더바 정리

      if (normalizedKey === 'e_l_filling') normalizedKey = 'el_filling';

      const matchedField = processFields.find((f) => f === normalizedKey);
      if (matchedField) {
        (plan as any)[matchedField] = data[key];
        console.log(`✅ 매핑됨: ${key} → ${matchedField}`);
      } else {
        console.warn(`⚠️ 매칭 실패: ${key} (${normalizedKey})`);
      }
    }

    await this.planRepository.save(plan);
    return { success: true, message: '프로젝트 일정이 저장되었습니다 ✅' };
  }

  async searchPlans(filters: { projectId?: number }) {
    const { projectId } = filters;
    if (!projectId) return [];

    return this.planRepository.find({
      where: { project: { id: projectId } },
      relations: ['project'],
      order: { startDate: 'ASC' },
    });
  }
}
