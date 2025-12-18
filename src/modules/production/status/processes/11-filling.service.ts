import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { WorklogFilling } from 'src/common/entities/worklogs/worklog-12-filling.entity';
import { ProductionPlan } from 'src/common/entities/production-plan.entity';
import { ProductionTarget } from 'src/common/entities/production-target.entity';

@Injectable()
export class FillingProcessService {
  constructor(
    @InjectRepository(WorklogFilling)
    private readonly fillingRepository: Repository<WorklogFilling>,
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

    const fillingLogs = await this.fillingRepository.find({
      where: {
        production: { id: productionId },
        manufactureDate: Between(projectStartDate, endDate),
      },
      order: { manufactureDate: 'ASC' },
    });

    return this.processFillingData(fillingLogs, month, productionTarget, startDate, endDate);
  }

  private processFillingData(
    logs: WorklogFilling[],
    month: string,
    productionTarget: ProductionTarget | null,
    monthStartDate: Date,
    monthEndDate: Date,
  ) {
    const dailyMap = new Map<number, { output: number; ng: number }>();
    let cumulativeOutput = 0;

    for (const log of logs) {
      const logDate = new Date(log.manufactureDate);
      const isCurrentMonth = logDate >= monthStartDate && logDate <= monthEndDate;
      const day = logDate.getDate();

      const output = Number(log.fillingWorkQuantity) || 0;
      cumulativeOutput += output;

      if (isCurrentMonth) {
        const current = dailyMap.get(day) || { output: 0, ng: 0 };
        current.output += output;
        current.ng += (Number(log.fillingDefectQuantity) || 0) + (Number(log.waitingDefectQuantity) || 0);
        dailyMap.set(day, current);
      }
    }

    return this.buildResult(dailyMap, month, productionTarget, cumulativeOutput);
  }

  private buildResult(
    dailyMap: Map<number, { output: number; ng: number }>,
    month: string,
    productionTarget: ProductionTarget | null,
    cumulativeOutput: number,
  ) {
    const daysInMonth = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0).getDate();

    const data: Array<{
      day: number;
      output: number;
      ng: number | null;
      yield: number | null;
    }> = [];

    let totalOutput = 0;
    let totalNg = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = dailyMap.get(day);

      if (dayData) {
        const dayYield = dayData.output > 0 ? Math.round(((dayData.output - dayData.ng) / dayData.output) * 100 * 100) / 100 : null;
        data.push({
          day,
          output: dayData.output,
          ng: dayData.output > 0 ? dayData.ng : null,
          yield: dayYield,
        });

        totalOutput += dayData.output;
        totalNg += dayData.ng;
      } else {
        data.push({ day, output: 0, ng: null, yield: null });
      }
    }

    const targetQuantity = productionTarget?.filling || null;
    const progress = targetQuantity && cumulativeOutput > 0 ? Math.round((cumulativeOutput / targetQuantity) * 100 * 100) / 100 : null;

    const totalYield = totalOutput > 0 ? Math.round(((totalOutput - totalNg) / totalOutput) * 100 * 100) / 100 : null;

    return {
      data,
      total: {
        totalOutput,
        cumulativeOutput,
        targetQuantity,
        progress,
        totalNg: totalOutput > 0 ? totalNg : null,
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
