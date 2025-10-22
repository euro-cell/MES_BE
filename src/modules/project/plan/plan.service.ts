import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductionPlan } from '../../../common/entities/production-plan.entity';
import { Production } from '../../../common/entities/production.entity';
import { Between, Like, Repository } from 'typeorm';

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(ProductionPlan)
    private readonly planRepository: Repository<ProductionPlan>,
    @InjectRepository(Production)
    private readonly ProductionRepository: Repository<Production>,
  ) {}

  async savePlan(productionId: number, data: Record<string, string>) {
    const project = await this.ProductionRepository.findOne({
      where: { id: productionId },
    });
    if (!project) throw new Error('프로젝트를 찾을 수 없습니다.');

    let plan = await this.planRepository.findOne({
      where: { production: { id: productionId } },
    });
    if (!plan) {
      plan = new ProductionPlan();
      plan.production = project;
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

  async searchPlans(filters: { productionId?: number }) {
    const { productionId } = filters;
    if (!productionId) return [];

    return this.planRepository.find({
      where: { production: { id: productionId } },
      relations: ['production'],
      order: { startDate: 'ASC' },
    });
  }
}
