import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { WorklogCoating } from 'src/common/entities/worklogs/worklog-03-coating.entity';
import { ProductionPlan } from 'src/common/entities/production-plan.entity';
import { ProductionTarget } from 'src/common/entities/production-target.entity';

@Injectable()
export class CoatingProcessService {
  constructor(
    @InjectRepository(WorklogCoating)
    private readonly coatingRepository: Repository<WorklogCoating>,
    @InjectRepository(ProductionPlan)
    private readonly productionPlanRepository: Repository<ProductionPlan>,
    @InjectRepository(ProductionTarget)
    private readonly productionTargetRepository: Repository<ProductionTarget>,
  ) {}

  async getMonthlyData(productionId: number, month: string, type: 'cathode' | 'anode') {
    const [productionPlan, productionTarget] = await Promise.all([
      this.productionPlanRepository.findOne({
        where: { production: { id: productionId } },
      }),
      this.productionTargetRepository.findOne({
        where: { production: { id: productionId } },
      }),
    ]);

    if (!productionPlan) throw new NotFoundException('생산 계획이 존재하지 않습니다.');

    const { endDate } = this.getMonthRange(month);
    const projectStartDate = new Date(productionPlan.startDate);

    // type에 따라 5번째 문자 결정 (C: 양극(cathode), A: 음극(anode))
    const targetChar = type === 'cathode' ? 'C' : 'A';

    const coatingLogs = await this.coatingRepository.find({
      where: {
        production: { id: productionId },
        manufactureDate: Between(projectStartDate, endDate),
      },
      order: { manufactureDate: 'ASC' },
    });

    // 단면/양면 분리
    const singleData = this.processCoatingData(coatingLogs, targetChar, '단면', month, productionTarget, type);
    const doubleData = this.processCoatingData(coatingLogs, targetChar, '양면', month, productionTarget, type);

    return {
      single: singleData,
      double: doubleData,
    };
  }

  private processCoatingData(
    logs: WorklogCoating[],
    targetChar: string,
    coatingType: '단면' | '양면',
    month: string,
    productionTarget: ProductionTarget | null,
    type: 'cathode' | 'anode',
  ) {
    const dailyMap = new Map<number, number>();

    for (const log of logs) {
      const day = new Date(log.manufactureDate).getDate();
      const current = dailyMap.get(day) || 0;

      const coatingFields = [
        { lot: log.coatingLot1, quantity: log.productionQuantity1, side: log.coatingSide1 },
        { lot: log.coatingLot2, quantity: log.productionQuantity2, side: log.coatingSide2 },
        { lot: log.coatingLot3, quantity: log.productionQuantity3, side: log.coatingSide3 },
        { lot: log.coatingLot4, quantity: log.productionQuantity4, side: log.coatingSide4 },
      ];

      let dayTotal = current;
      for (const field of coatingFields) {
        // lot의 5번째 문자가 targetChar이고, coatingSide가 coatingType과 일치하는지 확인
        if (field.lot && field.lot.length >= 5 && field.lot[4] === targetChar && field.side === coatingType) {
          dayTotal += Number(field.quantity) || 0;
        }
      }
      dailyMap.set(day, dayTotal);
    }

    const daysInMonth = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0).getDate();
    const data: Array<{ day: number; output: number; ng: number | null; yield: number | null }> = [];
    let totalOutput = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const output = dailyMap.get(day) || 0;
      data.push({ day, output, ng: null, yield: null });
      totalOutput += output;
    }

    // targetQuantity 설정
    const targetField =
      coatingType === '단면'
        ? type === 'cathode'
          ? 'coatingSingleCathode'
          : 'coatingSingleAnode'
        : type === 'cathode'
          ? 'coatingDoubleCathode'
          : 'coatingDoubleAnode';

    const targetQuantity = productionTarget?.[targetField] || null;
    const progress = targetQuantity ? Math.round((totalOutput / targetQuantity) * 100 * 100) / 100 : null;

    return {
      data,
      total: {
        totalOutput,
        targetQuantity,
        progress,
      },
    };
  }

  private getMonthRange(month: string): { startDate: Date; endDate: Date } {
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);
    return { startDate, endDate };
  }
}
