import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { WorklogGrading } from 'src/common/entities/worklogs/worklog-14-grading.entity';
import { ProductionPlan } from 'src/common/entities/production-plan.entity';
import { ProductionTarget } from 'src/common/entities/production-target.entity';

@Injectable()
export class GradingProcessService {
  constructor(
    @InjectRepository(WorklogGrading)
    private readonly gradingRepository: Repository<WorklogGrading>,
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

    const gradingLogs = await this.gradingRepository.find({
      where: {
        production: { id: productionId },
        manufactureDate: Between(projectStartDate, endDate),
      },
      order: { manufactureDate: 'ASC' },
    });

    return this.processGradingData(gradingLogs, month, productionTarget, startDate, endDate);
  }

  private processGradingData(
    logs: WorklogGrading[],
    month: string,
    productionTarget: ProductionTarget | null,
    monthStartDate: Date,
    monthEndDate: Date,
  ) {
    const dailyMap = new Map<
      number,
      {
        aging: { input: number; good: number };
        grading: { input: number; ocv3Good: number };
      }
    >();

    const cumulativeTotals = {
      aging: 0,
      grading: 0,
    };

    for (const log of logs) {
      const logDate = new Date(log.manufactureDate);
      const isCurrentMonth = logDate >= monthStartDate && logDate <= monthEndDate;
      const day = logDate.getDate();

      const agingInput = Number(log.ocv2InputQuantity) || 0;
      const gradingInput = Number(log.gradingInputQuantity) || 0;

      cumulativeTotals.aging += agingInput;
      cumulativeTotals.grading += gradingInput;

      if (isCurrentMonth) {
        const current = dailyMap.get(day) || {
          aging: { input: 0, good: 0 },
          grading: { input: 0, ocv3Good: 0 },
        };

        // Aging (OCV2)
        current.aging.input += agingInput;
        current.aging.good += Number(log.ocv2GoodQuantity) || 0;

        // Grading (OCV3)
        current.grading.input += gradingInput;
        current.grading.ocv3Good += Number(log.ocv3GoodQuantity) || 0;

        dailyMap.set(day, current);
      }
    }

    return this.buildResult(dailyMap, month, productionTarget, cumulativeTotals);
  }

  private buildResult(
    dailyMap: Map<
      number,
      {
        aging: { input: number; good: number };
        grading: { input: number; ocv3Good: number };
      }
    >,
    month: string,
    productionTarget: ProductionTarget | null,
    cumulativeTotals: { aging: number; grading: number },
  ) {
    const daysInMonth = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0).getDate();

    const agingData: Array<{
      day: number;
      output: number;
      ng: number | null;
      yield: number | null;
    }> = [];

    const gradingData: Array<{
      day: number;
      output: number;
      ng: number | null;
      yield: number | null;
    }> = [];

    let totalAging = { output: 0, good: 0 };
    let totalGrading = { output: 0, ocv3Good: 0 };

    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = dailyMap.get(day);

      if (dayData) {
        // Aging (OCV2)
        const agingNg = dayData.aging.input - dayData.aging.good;
        const agingYield =
          dayData.aging.input > 0
            ? Math.round((dayData.aging.good / dayData.aging.input) * 100 * 100) / 100
            : null;
        agingData.push({
          day,
          output: dayData.aging.input,
          ng: dayData.aging.input > 0 ? agingNg : null,
          yield: agingYield,
        });

        // Grading (OCV3)
        const gradingNg = dayData.grading.input - dayData.grading.ocv3Good;
        const gradingYield =
          dayData.grading.input > 0
            ? Math.round((dayData.grading.ocv3Good / dayData.grading.input) * 100 * 100) / 100
            : null;
        gradingData.push({
          day,
          output: dayData.grading.input,
          ng: dayData.grading.input > 0 ? gradingNg : null,
          yield: gradingYield,
        });

        // Totals
        totalAging.output += dayData.aging.input;
        totalAging.good += dayData.aging.good;

        totalGrading.output += dayData.grading.input;
        totalGrading.ocv3Good += dayData.grading.ocv3Good;
      } else {
        agingData.push({ day, output: 0, ng: null, yield: null });
        gradingData.push({ day, output: 0, ng: null, yield: null });
      }
    }

    // Aging totals
    const agingTargetQuantity = productionTarget?.aging || null;
    const agingTotalNg = totalAging.output - totalAging.good;
    const agingProgress =
      agingTargetQuantity && cumulativeTotals.aging > 0
        ? Math.round((cumulativeTotals.aging / agingTargetQuantity) * 100 * 100) / 100
        : null;
    const agingTotalYield =
      totalAging.output > 0
        ? Math.round((totalAging.good / totalAging.output) * 100 * 100) / 100
        : null;

    // Grading totals
    const gradingTargetQuantity = productionTarget?.grading || null;
    const gradingTotalNg = totalGrading.output - totalGrading.ocv3Good;
    const gradingProgress =
      gradingTargetQuantity && cumulativeTotals.grading > 0
        ? Math.round((cumulativeTotals.grading / gradingTargetQuantity) * 100 * 100) / 100
        : null;
    const gradingTotalYield =
      totalGrading.output > 0
        ? Math.round((totalGrading.ocv3Good / totalGrading.output) * 100 * 100) / 100
        : null;

    return {
      aging: {
        data: agingData,
        total: {
          totalOutput: totalAging.output,
          targetQuantity: agingTargetQuantity,
          progress: agingProgress,
          totalNg: totalAging.output > 0 ? agingTotalNg : null,
          totalYield: agingTotalYield,
        },
      },
      grading: {
        data: gradingData,
        total: {
          totalOutput: totalGrading.output,
          targetQuantity: gradingTargetQuantity,
          progress: gradingProgress,
          totalNg: totalGrading.output > 0 ? gradingTotalNg : null,
          totalYield: gradingTotalYield,
        },
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
