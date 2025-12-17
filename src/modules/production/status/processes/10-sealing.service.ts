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

    const sealingLogs = await this.sealingRepository.find({
      where: {
        production: { id: productionId },
        manufactureDate: Between(startDate, endDate),
      },
      order: { manufactureDate: 'ASC' },
    });

    return this.processSealingData(sealingLogs, month, productionTarget);
  }

  private parseNcrFromRemark(remark: string | null): {
    hiPot: number;
    appearance: number;
    thickness: number;
    etc: number;
  } {
    const result = { hiPot: 0, appearance: 0, thickness: 0, etc: 0 };
    if (!remark) return result;

    const countCellNumbers = (value: string): number => {
      if (!value || !value.trim()) return 0;
      return value.split(',').filter((v) => v.trim()).length;
    };

    const hiPotMatch = remark.match(/Hi-pot\s*:\s*([^\n]*)/i);
    if (hiPotMatch) result.hiPot = countCellNumbers(hiPotMatch[1]);

    const appearanceMatch = remark.match(/외관\s*:\s*([^\n]*)/);
    if (appearanceMatch) result.appearance = countCellNumbers(appearanceMatch[1]);

    const thicknessMatch = remark.match(/두께\s*:\s*([^\n]*)/);
    if (thicknessMatch) result.thickness = countCellNumbers(thicknessMatch[1]);

    const etcMatch = remark.match(/기타\s*:\s*([^\n]*)/);
    if (etcMatch) result.etc = countCellNumbers(etcMatch[1]);

    return result;
  }

  private processSealingData(logs: WorklogSealing[], month: string, productionTarget: ProductionTarget | null) {
    const dailyMap = new Map<
      number,
      {
        output: number;
        ncr: { hiPot: number; appearance: number; thickness: number; etc: number };
      }
    >();

    for (const log of logs) {
      const day = new Date(log.manufactureDate).getDate();
      const current = dailyMap.get(day) || {
        output: 0,
        ncr: { hiPot: 0, appearance: 0, thickness: 0, etc: 0 },
      };

      current.output += Number(log.topWorkQuantity) || 0;

      const ncr = this.parseNcrFromRemark(log.remark);
      current.ncr.hiPot += ncr.hiPot;
      current.ncr.appearance += ncr.appearance;
      current.ncr.thickness += ncr.thickness;
      current.ncr.etc += ncr.etc;

      dailyMap.set(day, current);
    }

    return this.buildResult(dailyMap, month, productionTarget);
  }

  private buildResult(
    dailyMap: Map<number, { output: number; ncr: { hiPot: number; appearance: number; thickness: number; etc: number } }>,
    month: string,
    productionTarget: ProductionTarget | null,
  ) {
    const daysInMonth = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0).getDate();

    const data: Array<{
      day: number;
      output: number;
      ng: number | null;
      ncr: { hiPot: number; appearance: number; thickness: number; etc: number } | null;
    }> = [];

    let totalOutput = 0;
    const totalNcr = { hiPot: 0, appearance: 0, thickness: 0, etc: 0 };

    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = dailyMap.get(day);

      if (dayData) {
        const ngTotal = dayData.ncr.hiPot + dayData.ncr.appearance + dayData.ncr.thickness + dayData.ncr.etc;
        const ng = dayData.output > 0 ? ngTotal : null;

        data.push({
          day,
          output: dayData.output,
          ng,
          ncr: dayData.output > 0 ? dayData.ncr : null,
        });

        totalOutput += dayData.output;
        totalNcr.hiPot += dayData.ncr.hiPot;
        totalNcr.appearance += dayData.ncr.appearance;
        totalNcr.thickness += dayData.ncr.thickness;
        totalNcr.etc += dayData.ncr.etc;
      } else {
        data.push({ day, output: 0, ng: null, ncr: null });
      }
    }

    const totalNgSum = totalNcr.hiPot + totalNcr.appearance + totalNcr.thickness + totalNcr.etc;
    const totalNg = totalOutput > 0 ? totalNgSum : null;

    const targetQuantity = productionTarget?.sealing || null;
    const progress = targetQuantity && totalOutput > 0 ? Math.round((totalOutput / targetQuantity) * 100 * 100) / 100 : null;

    const totalYield = totalOutput > 0 && totalNgSum >= 0 ? Math.round(((totalOutput - totalNgSum) / totalOutput) * 100 * 100) / 100 : null;

    return {
      data,
      total: {
        totalOutput,
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
