import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { WorklogFormation } from 'src/common/entities/worklogs/worklog-13-formation.entity';
import { ProductionPlan } from 'src/common/entities/production-plan.entity';
import { ProductionTarget } from 'src/common/entities/production-target.entity';

@Injectable()
export class FormationProcessService {
  constructor(
    @InjectRepository(WorklogFormation)
    private readonly formationRepository: Repository<WorklogFormation>,
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

    const formationLogs = await this.formationRepository.find({
      where: {
        production: { id: productionId },
        manufactureDate: Between(projectStartDate, endDate),
      },
      order: { manufactureDate: 'ASC' },
    });

    return this.processFormationData(formationLogs, month, productionTarget, startDate, endDate);
  }

  private processFormationData(
    logs: WorklogFormation[],
    month: string,
    productionTarget: ProductionTarget | null,
    monthStartDate: Date,
    monthEndDate: Date,
  ) {
    const dailyMap = new Map<
      number,
      {
        preFormation: { input: number; good: number };
        degas: { input: number; good: number };
        mainFormation: { input: number; ocv1Good: number };
      }
    >();

    const cumulativeTotals = {
      preFormation: 0,
      degas: 0,
      mainFormation: 0,
    };

    for (const log of logs) {
      const logDate = new Date(log.manufactureDate);
      const isCurrentMonth = logDate >= monthStartDate && logDate <= monthEndDate;
      const day = logDate.getDate();

      const preFormationInput = Number(log.preFormationInputQuantity) || 0;
      const degasInput = Number(log.degas2InputQuantity) || 0;
      const mainFormationInput = Number(log.mainFormationInputQuantity) || 0;

      cumulativeTotals.preFormation += preFormationInput;
      cumulativeTotals.degas += degasInput;
      cumulativeTotals.mainFormation += mainFormationInput;

      if (isCurrentMonth) {
        const current = dailyMap.get(day) || {
          preFormation: { input: 0, good: 0 },
          degas: { input: 0, good: 0 },
          mainFormation: { input: 0, ocv1Good: 0 },
        };

        // Pre Formation
        current.preFormation.input += preFormationInput;
        current.preFormation.good += Number(log.preFormationGoodQuantity) || 0;

        // Degas (디가스2만 사용)
        current.degas.input += degasInput;
        current.degas.good += Number(log.degas2GoodQuantity) || 0;

        // Main Formation + OCV/IR_1
        current.mainFormation.input += mainFormationInput;
        current.mainFormation.ocv1Good += Number(log.ocv1GoodQuantity) || 0;

        dailyMap.set(day, current);
      }
    }

    return this.buildResult(dailyMap, month, productionTarget, cumulativeTotals);
  }

  private buildResult(
    dailyMap: Map<
      number,
      {
        preFormation: { input: number; good: number };
        degas: { input: number; good: number };
        mainFormation: { input: number; ocv1Good: number };
      }
    >,
    month: string,
    productionTarget: ProductionTarget | null,
    cumulativeTotals: { preFormation: number; degas: number; mainFormation: number },
  ) {
    const daysInMonth = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0).getDate();

    const preFormationData: Array<{
      day: number;
      output: number;
      ng: number | null;
      yield: number | null;
    }> = [];

    const degasData: Array<{
      day: number;
      output: number;
      ng: number | null;
      yield: number | null;
    }> = [];

    const mainFormationData: Array<{
      day: number;
      output: number;
      ng: number | null;
      yield: number | null;
    }> = [];

    let totalPreFormation = { output: 0, good: 0 };
    let totalDegas = { output: 0, good: 0 };
    let totalMainFormation = { output: 0, ocv1Good: 0 };

    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = dailyMap.get(day);

      if (dayData) {
        // Pre Formation
        const preNg = dayData.preFormation.input - dayData.preFormation.good;
        const preYield =
          dayData.preFormation.input > 0
            ? Math.round((dayData.preFormation.good / dayData.preFormation.input) * 100 * 100) / 100
            : null;
        preFormationData.push({
          day,
          output: dayData.preFormation.input,
          ng: dayData.preFormation.input > 0 ? preNg : null,
          yield: preYield,
        });

        // Degas
        const degasNg = dayData.degas.input - dayData.degas.good;
        const degasYield =
          dayData.degas.input > 0 ? Math.round((dayData.degas.good / dayData.degas.input) * 100 * 100) / 100 : null;
        degasData.push({
          day,
          output: dayData.degas.input,
          ng: dayData.degas.input > 0 ? degasNg : null,
          yield: degasYield,
        });

        // Main Formation + OCV/IR_1
        const mainNg = dayData.mainFormation.input - dayData.mainFormation.ocv1Good;
        const mainYield =
          dayData.mainFormation.input > 0
            ? Math.round((dayData.mainFormation.ocv1Good / dayData.mainFormation.input) * 100 * 100) / 100
            : null;
        mainFormationData.push({
          day,
          output: dayData.mainFormation.input,
          ng: dayData.mainFormation.input > 0 ? mainNg : null,
          yield: mainYield,
        });

        // Totals
        totalPreFormation.output += dayData.preFormation.input;
        totalPreFormation.good += dayData.preFormation.good;

        totalDegas.output += dayData.degas.input;
        totalDegas.good += dayData.degas.good;

        totalMainFormation.output += dayData.mainFormation.input;
        totalMainFormation.ocv1Good += dayData.mainFormation.ocv1Good;
      } else {
        preFormationData.push({ day, output: 0, ng: null, yield: null });
        degasData.push({ day, output: 0, ng: null, yield: null });
        mainFormationData.push({ day, output: 0, ng: null, yield: null });
      }
    }

    // Pre Formation totals
    const preFormationTargetQuantity = productionTarget?.preFormation || null;
    const preFormationTotalNg = totalPreFormation.output - totalPreFormation.good;
    const preFormationProgress =
      preFormationTargetQuantity && cumulativeTotals.preFormation > 0
        ? Math.round((cumulativeTotals.preFormation / preFormationTargetQuantity) * 100 * 100) / 100
        : null;
    const preFormationTotalYield =
      totalPreFormation.output > 0
        ? Math.round((totalPreFormation.good / totalPreFormation.output) * 100 * 100) / 100
        : null;

    // Degas totals
    const degasTargetQuantity = productionTarget?.degas || null;
    const degasTotalNg = totalDegas.output - totalDegas.good;
    const degasProgress =
      degasTargetQuantity && cumulativeTotals.degas > 0
        ? Math.round((cumulativeTotals.degas / degasTargetQuantity) * 100 * 100) / 100
        : null;
    const degasTotalYield =
      totalDegas.output > 0 ? Math.round((totalDegas.good / totalDegas.output) * 100 * 100) / 100 : null;

    // Main Formation totals
    const mainFormationTargetQuantity = productionTarget?.mainFormation || null;
    const mainFormationTotalNg = totalMainFormation.output - totalMainFormation.ocv1Good;
    const mainFormationProgress =
      mainFormationTargetQuantity && cumulativeTotals.mainFormation > 0
        ? Math.round((cumulativeTotals.mainFormation / mainFormationTargetQuantity) * 100 * 100) / 100
        : null;
    const mainFormationTotalYield =
      totalMainFormation.output > 0
        ? Math.round((totalMainFormation.ocv1Good / totalMainFormation.output) * 100 * 100) / 100
        : null;

    return {
      preFormation: {
        data: preFormationData,
        total: {
          totalOutput: totalPreFormation.output,
          targetQuantity: preFormationTargetQuantity,
          progress: preFormationProgress,
          totalNg: totalPreFormation.output > 0 ? preFormationTotalNg : null,
          totalYield: preFormationTotalYield,
        },
      },
      degas: {
        data: degasData,
        total: {
          totalOutput: totalDegas.output,
          targetQuantity: degasTargetQuantity,
          progress: degasProgress,
          totalNg: totalDegas.output > 0 ? degasTotalNg : null,
          totalYield: degasTotalYield,
        },
      },
      mainFormation: {
        data: mainFormationData,
        total: {
          totalOutput: totalMainFormation.output,
          targetQuantity: mainFormationTargetQuantity,
          progress: mainFormationProgress,
          totalNg: totalMainFormation.output > 0 ? mainFormationTotalNg : null,
          totalYield: mainFormationTotalYield,
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
