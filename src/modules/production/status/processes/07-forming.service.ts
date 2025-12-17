import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { WorklogForming } from 'src/common/entities/worklogs/worklog-08-forming.entity';
import { ProductionPlan } from 'src/common/entities/production-plan.entity';
import { ProductionTarget } from 'src/common/entities/production-target.entity';

@Injectable()
export class FormingProcessService {
  constructor(
    @InjectRepository(WorklogForming)
    private readonly formingRepository: Repository<WorklogForming>,
    @InjectRepository(ProductionPlan)
    private readonly productionPlanRepository: Repository<ProductionPlan>,
    @InjectRepository(ProductionTarget)
    private readonly productionTargetRepository: Repository<ProductionTarget>,
  ) {}

  async getMonthlyData(productionId: number, month: string) {
    const [productionPlan, productionTarget] = await Promise.all([
      this.productionPlanRepository.findOne({
        where: { production: { id: productionId } },
      }),
      this.productionTargetRepository.findOne({
        where: { production: { id: productionId } },
      }),
    ]);

    if (!productionPlan) throw new NotFoundException('생산 계획이 존재하지 않습니다.');

    const { startDate, endDate } = this.getMonthRange(month);

    const formingLogs = await this.formingRepository.find({
      where: {
        production: { id: productionId },
        manufactureDate: Between(startDate, endDate),
      },
      order: { manufactureDate: 'ASC' },
    });

    return this.processFormingData(formingLogs, month, productionTarget);
  }

  private processFormingData(logs: WorklogForming[], month: string, productionTarget: ProductionTarget | null) {
    const processOrder = ['cutting', 'forming', 'folding', 'topCutting'] as const;

    const dailyMap = new Map<
      number,
      {
        cutting: { work: number; good: number; defect: number; discard: number };
        forming: { work: number; good: number; defect: number; discard: number };
        folding: { work: number; good: number; defect: number; discard: number };
        topCutting: { work: number; good: number; defect: number; discard: number };
      }
    >();

    for (const log of logs) {
      const day = new Date(log.manufactureDate).getDate();
      const current = dailyMap.get(day) || {
        cutting: { work: 0, good: 0, defect: 0, discard: 0 },
        forming: { work: 0, good: 0, defect: 0, discard: 0 },
        folding: { work: 0, good: 0, defect: 0, discard: 0 },
        topCutting: { work: 0, good: 0, defect: 0, discard: 0 },
      };

      // 컷팅
      current.cutting.work += Number(log.cuttingWorkQuantity) || 0;
      current.cutting.good += Number(log.cuttingGoodQuantity) || 0;
      current.cutting.defect += Number(log.cuttingDefectQuantity) || 0;
      current.cutting.discard += Number(log.cuttingDiscardQuantity) || 0;

      // 포밍
      current.forming.work += Number(log.formingWorkQuantity) || 0;
      current.forming.good += Number(log.formingGoodQuantity) || 0;
      current.forming.defect += Number(log.formingDefectQuantity) || 0;
      current.forming.discard += Number(log.formingDiscardQuantity) || 0;

      // 폴딩
      current.folding.work += Number(log.foldingWorkQuantity) || 0;
      current.folding.good += Number(log.foldingGoodQuantity) || 0;
      current.folding.defect += Number(log.foldingDefectQuantity) || 0;
      current.folding.discard += Number(log.foldingDiscardQuantity) || 0;

      // 탑컷팅
      current.topCutting.work += Number(log.topCuttingWorkQuantity) || 0;
      current.topCutting.good += Number(log.topCuttingGoodQuantity) || 0;
      current.topCutting.defect += Number(log.topCuttingDefectQuantity) || 0;
      current.topCutting.discard += Number(log.topCuttingDiscardQuantity) || 0;

      dailyMap.set(day, current);
    }

    return this.buildResult(dailyMap, month, productionTarget, processOrder);
  }

  private buildResult(
    dailyMap: Map<
      number,
      {
        cutting: { work: number; good: number; defect: number; discard: number };
        forming: { work: number; good: number; defect: number; discard: number };
        folding: { work: number; good: number; defect: number; discard: number };
        topCutting: { work: number; good: number; defect: number; discard: number };
      }
    >,
    month: string,
    productionTarget: ProductionTarget | null,
    processOrder: readonly ['cutting', 'forming', 'folding', 'topCutting'],
  ) {
    const daysInMonth = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0).getDate();

    const calculateDayYield = (
      dayData:
        | {
            cutting: { work: number; good: number; defect: number; discard: number };
            forming: { work: number; good: number; defect: number; discard: number };
            folding: { work: number; good: number; defect: number; discard: number };
            topCutting: { work: number; good: number; defect: number; discard: number };
          }
        | undefined,
    ): number | null => {
      if (!dayData) return null;

      let firstWork: number | null = null;
      let lastGood: number | null = null;

      for (const process of processOrder) {
        if (dayData[process].work > 0) {
          firstWork = dayData[process].work;
          break;
        }
      }

      for (let i = processOrder.length - 1; i >= 0; i--) {
        const process = processOrder[i];
        if (dayData[process].good > 0) {
          lastGood = dayData[process].good;
          break;
        }
      }

      if (firstWork && lastGood) {
        return Math.round((lastGood / firstWork) * 100 * 100) / 100;
      }
      return null;
    };

    const result: Record<
      string,
      {
        data: Array<{
          day: number;
          output: number;
          ng: number | null;
        }>;
        total: {
          totalOutput: number;
          totalNg: number | null;
        };
      }
    > = {};

    const yieldData: Array<{ day: number; yield: number | null }> = [];
    let totalFirstWork = 0;
    let totalLastGood = 0;

    // 포밍 목표수량 (통합)
    const targetQuantity = productionTarget?.forming || null;

    // 각 서브공정별 합계 먼저 계산
    const subProcessTotals: Record<string, number> = {};
    for (const subProcess of processOrder) {
      let total = 0;
      for (let day = 1; day <= daysInMonth; day++) {
        const dayData = dailyMap.get(day);
        total += dayData?.[subProcess].work || 0;
      }
      subProcessTotals[subProcess] = total;
    }

    // 마지막으로 작업된 공정의 양품 합계로 진행률 계산 (역순으로 찾기)
    let lastProcessOutput = 0;
    for (let i = processOrder.length - 1; i >= 0; i--) {
      const process = processOrder[i];
      if (subProcessTotals[process] > 0) {
        lastProcessOutput = subProcessTotals[process];
        break;
      }
    }

    // 진행률 계산 (마지막 공정 합계 / 목표수량)
    const progress = targetQuantity && lastProcessOutput > 0
      ? Math.round((lastProcessOutput / targetQuantity) * 100 * 100) / 100
      : null;

    for (const subProcess of processOrder) {
      const data: Array<{ day: number; output: number; ng: number | null }> = [];
      let totalOutput = 0;
      let totalDefect = 0;

      for (let day = 1; day <= daysInMonth; day++) {
        const dayData = dailyMap.get(day);
        const subData = dayData?.[subProcess] || { work: 0, good: 0, defect: 0, discard: 0 };

        // 작업수량이 있으면 ng는 0이라도 표시, 없으면 null
        const ng = subData.work > 0 ? subData.defect : null;

        data.push({ day, output: subData.work, ng });

        totalOutput += subData.work;
        totalDefect += subData.defect;
      }

      result[subProcess] = {
        data,
        total: {
          totalOutput,
          // 총 생산량이 있으면 totalNg는 0이라도 표시
          totalNg: totalOutput > 0 ? totalDefect : null,
        },
      };
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = dailyMap.get(day);
      const dayYield = calculateDayYield(dayData);
      yieldData.push({ day, yield: dayYield });

      if (dayData) {
        for (const process of processOrder) {
          if (dayData[process].work > 0) {
            totalFirstWork += dayData[process].work;
            break;
          }
        }
        for (let i = processOrder.length - 1; i >= 0; i--) {
          const process = processOrder[i];
          if (dayData[process].good > 0) {
            totalLastGood += dayData[process].good;
            break;
          }
        }
      }
    }

    const totalYield = totalFirstWork > 0 && totalLastGood > 0 ? Math.round((totalLastGood / totalFirstWork) * 100 * 100) / 100 : null;

    return {
      ...result,
      yield: {
        data: yieldData,
        total: totalYield,
      },
      targetQuantity,
      progress,
    };
  }

  private getMonthRange(month: string): { startDate: Date; endDate: Date } {
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);
    return { startDate, endDate };
  }
}
