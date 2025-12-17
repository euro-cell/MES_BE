import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { WorklogStacking } from 'src/common/entities/worklogs/worklog-09-stacking.entity';
import { ProductionPlan } from 'src/common/entities/production-plan.entity';
import { ProductionTarget } from 'src/common/entities/production-target.entity';

@Injectable()
export class StackingProcessService {
  constructor(
    @InjectRepository(WorklogStacking)
    private readonly stackingRepository: Repository<WorklogStacking>,
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

    const stackingLogs = await this.stackingRepository.find({
      where: {
        production: { id: productionId },
        manufactureDate: Between(startDate, endDate),
      },
      order: { manufactureDate: 'ASC' },
    });

    return this.processStackingData(stackingLogs, month, productionTarget);
  }

  private parseNcrFromRemark(remark: string | null): {
    hiPot: number;
    weight: number;
    thickness: number;
    alignment: number;
  } {
    const result = { hiPot: 0, weight: 0, thickness: 0, alignment: 0 };
    if (!remark) return result;

    const countCellNumbers = (value: string): number => {
      if (!value || !value.trim()) return 0;
      return value.split(',').filter((v) => v.trim()).length;
    };

    const hiPotMatch = remark.match(/Hi-pot\s*:\s*([^\n]*)/i);
    if (hiPotMatch) result.hiPot = countCellNumbers(hiPotMatch[1]);

    const weightMatch = remark.match(/무게\s*:\s*([^\n]*)/);
    if (weightMatch) result.weight = countCellNumbers(weightMatch[1]);

    const thicknessMatch = remark.match(/두께\s*:\s*([^\n]*)/);
    if (thicknessMatch) result.thickness = countCellNumbers(thicknessMatch[1]);

    const alignMatch = remark.match(/Alignment\s*:\s*([^\n]*)/i);
    if (alignMatch) result.alignment = countCellNumbers(alignMatch[1]);

    return result;
  }

  private processStackingData(logs: WorklogStacking[], month: string, productionTarget: ProductionTarget | null) {
    const dailyMap = new Map<
      number,
      {
        output: number;
        ncr: { hiPot: number; weight: number; thickness: number; alignment: number };
      }
    >();

    for (const log of logs) {
      const day = new Date(log.manufactureDate).getDate();
      const current = dailyMap.get(day) || {
        output: 0,
        ncr: { hiPot: 0, weight: 0, thickness: 0, alignment: 0 },
      };

      current.output += Number(log.stackActualInput) || 0;

      const ncr = this.parseNcrFromRemark(log.remark);
      current.ncr.hiPot += ncr.hiPot;
      current.ncr.weight += ncr.weight;
      current.ncr.thickness += ncr.thickness;
      current.ncr.alignment += ncr.alignment;

      dailyMap.set(day, current);
    }

    return this.buildResult(dailyMap, month, productionTarget);
  }

  private buildResult(
    dailyMap: Map<number, { output: number; ncr: { hiPot: number; weight: number; thickness: number; alignment: number } }>,
    month: string,
    productionTarget: ProductionTarget | null,
  ) {
    const daysInMonth = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0).getDate();

    const data: Array<{
      day: number;
      output: number;
      ng: number | null;
      ncr: { hiPot: number; weight: number; thickness: number; alignment: number } | null;
      yield: number | null;
    }> = [];

    let totalOutput = 0;
    const totalNcr = { hiPot: 0, weight: 0, thickness: 0, alignment: 0 };

    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = dailyMap.get(day);

      if (dayData) {
        const ngTotal = dayData.ncr.hiPot + dayData.ncr.weight + dayData.ncr.thickness + dayData.ncr.alignment;
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
        totalNcr.weight += dayData.ncr.weight;
        totalNcr.thickness += dayData.ncr.thickness;
        totalNcr.alignment += dayData.ncr.alignment;
      } else {
        data.push({ day, output: 0, ng: null, ncr: null, yield: null });
      }
    }

    const totalNgSum = totalNcr.hiPot + totalNcr.weight + totalNcr.thickness + totalNcr.alignment;
    const totalNg = totalOutput > 0 ? totalNgSum : null;

    const targetQuantity = productionTarget?.stack || null;
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
