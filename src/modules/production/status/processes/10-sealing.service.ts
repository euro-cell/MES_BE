import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { WorklogSealing } from 'src/common/entities/worklogs/worklog-11-sealing.entity';
import { ProductionPlan } from 'src/common/entities/production-plan.entity';
import { ProductionTarget } from 'src/common/entities/production-target.entity';

@Injectable()
export class SealingProcessService {
  constructor(
    @InjectRepository(WorklogSealing)
    private readonly sealingRepository: Repository<WorklogSealing>,
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
    const projectStartDate = new Date(productionPlan.startDate);

    const sealingLogs = await this.sealingRepository.find({
      where: {
        production: { id: productionId },
        manufactureDate: Between(projectStartDate, endDate),
      },
      order: { manufactureDate: 'ASC' },
    });

    return this.processSealingData(sealingLogs, month, productionTarget, startDate, endDate);
  }

  private parseNcrFromRemarks(remarkTop: string | null, remarkSide: string | null): {
    hiPot: number;
    appearance: number;
    thickness: number;
    etc: number;
  } {
    const result = { hiPot: 0, appearance: 0, thickness: 0, etc: 0 };

    const countCellNumbers = (value: string): number => {
      if (!value || !value.trim()) return 0;
      return value.split(',').filter((v) => v.trim()).length;
    };

    // Top remark parsing
    if (remarkTop) {
      // Top - Seal 돌출, 파우치 두께, 탑실 두께 → thickness
      const sealProtrusionMatch = remarkTop.match(/Seal\s*돌출\s*:\s*([^\n]*)/);
      if (sealProtrusionMatch) result.thickness += countCellNumbers(sealProtrusionMatch[1]);

      const pouchThicknessMatch = remarkTop.match(/파우치\s*두께\s*:\s*([^\n]*)/);
      if (pouchThicknessMatch) result.thickness += countCellNumbers(pouchThicknessMatch[1]);

      const topSealThicknessMatch = remarkTop.match(/탑실\s*두께\s*:\s*([^\n]*)/);
      if (topSealThicknessMatch) result.thickness += countCellNumbers(topSealThicknessMatch[1]);

      // Top - 외관 → appearance
      const topAppearanceMatch = remarkTop.match(/외관\s*:\s*([^\n]*)/);
      if (topAppearanceMatch) result.appearance += countCellNumbers(topAppearanceMatch[1]);

      // Top - 기타 → etc
      const topEtcMatch = remarkTop.match(/기타\s*:\s*([^\n]*)/);
      if (topEtcMatch) result.etc += countCellNumbers(topEtcMatch[1]);
    }

    // Side remark parsing
    if (remarkSide) {
      // Side - 파우치 두께, 실 폭 → thickness
      const sidePouchThicknessMatch = remarkSide.match(/파우치\s*두께\s*:\s*([^\n]*)/);
      if (sidePouchThicknessMatch) result.thickness += countCellNumbers(sidePouchThicknessMatch[1]);

      const sealWidthMatch = remarkSide.match(/실\s*폭\s*:\s*([^\n]*)/);
      if (sealWidthMatch) result.thickness += countCellNumbers(sealWidthMatch[1]);

      // Side - 외관 → appearance
      const sideAppearanceMatch = remarkSide.match(/외관\s*:\s*([^\n]*)/);
      if (sideAppearanceMatch) result.appearance += countCellNumbers(sideAppearanceMatch[1]);

      // Side - H-pot → hiPot
      const hiPotMatch = remarkSide.match(/H-pot\s*:\s*([^\n]*)/i);
      if (hiPotMatch) result.hiPot += countCellNumbers(hiPotMatch[1]);

      // Side - 기타 → etc
      const sideEtcMatch = remarkSide.match(/기타\s*:\s*([^\n]*)/);
      if (sideEtcMatch) result.etc += countCellNumbers(sideEtcMatch[1]);
    }

    return result;
  }

  private processSealingData(
    logs: WorklogSealing[],
    month: string,
    productionTarget: ProductionTarget | null,
    monthStartDate: Date,
    monthEndDate: Date,
  ) {
    const dailyMap = new Map<
      number,
      {
        output: number;
        ncr: { hiPot: number; appearance: number; thickness: number; etc: number };
      }
    >();

    let cumulativeOutput = 0;

    for (const log of logs) {
      const logDate = new Date(log.manufactureDate);
      const isCurrentMonth = logDate >= monthStartDate && logDate <= monthEndDate;
      const day = logDate.getDate();

      const output = Number(log.topWorkQuantity) || 0;
      cumulativeOutput += output;

      if (isCurrentMonth) {
        const current = dailyMap.get(day) || {
          output: 0,
          ncr: { hiPot: 0, appearance: 0, thickness: 0, etc: 0 },
        };

        current.output += output;

        const ncr = this.parseNcrFromRemarks(log.remarkTop, log.remarkSide);
        current.ncr.hiPot += ncr.hiPot;
        current.ncr.appearance += ncr.appearance;
        current.ncr.thickness += ncr.thickness;
        current.ncr.etc += ncr.etc;

        dailyMap.set(day, current);
      }
    }

    return this.buildResult(dailyMap, month, productionTarget, cumulativeOutput);
  }

  private buildResult(
    dailyMap: Map<number, { output: number; ncr: { hiPot: number; appearance: number; thickness: number; etc: number } }>,
    month: string,
    productionTarget: ProductionTarget | null,
    cumulativeOutput: number,
  ) {
    const daysInMonth = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0).getDate();

    const data: Array<{
      day: number;
      output: number;
      ng: number | null;
      ncr: { hiPot: number; appearance: number; thickness: number; etc: number } | null;
      yield: number | null;
    }> = [];

    let totalOutput = 0;
    const totalNcr = { hiPot: 0, appearance: 0, thickness: 0, etc: 0 };

    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = dailyMap.get(day);

      if (dayData) {
        const ngTotal = dayData.ncr.hiPot + dayData.ncr.appearance + dayData.ncr.thickness + dayData.ncr.etc;
        const ng = dayData.output > 0 ? ngTotal : null;
        const dayYield = dayData.output > 0 ? Math.round(((dayData.output - ngTotal) / dayData.output) * 100 * 100) / 100 : null;

        data.push({
          day,
          output: dayData.output,
          ng,
          ncr: dayData.output > 0 ? dayData.ncr : null,
          yield: dayYield,
        });

        totalOutput += dayData.output;
        totalNcr.hiPot += dayData.ncr.hiPot;
        totalNcr.appearance += dayData.ncr.appearance;
        totalNcr.thickness += dayData.ncr.thickness;
        totalNcr.etc += dayData.ncr.etc;
      } else {
        data.push({ day, output: 0, ng: null, ncr: null, yield: null });
      }
    }

    const totalNgSum = totalNcr.hiPot + totalNcr.appearance + totalNcr.thickness + totalNcr.etc;
    const totalNg = totalOutput > 0 ? totalNgSum : null;

    const targetQuantity = productionTarget?.sealing || null;
    const progress = targetQuantity && cumulativeOutput > 0 ? Math.round((cumulativeOutput / targetQuantity) * 100 * 100) / 100 : null;

    const totalYield = totalOutput > 0 && totalNgSum >= 0 ? Math.round(((totalOutput - totalNgSum) / totalOutput) * 100 * 100) / 100 : null;

    return {
      data,
      total: {
        totalOutput,
        cumulativeOutput,
        targetQuantity,
        progress,
        totalNg,
        ncr: totalOutput > 0 ? totalNcr : null,
        totalYield,
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
