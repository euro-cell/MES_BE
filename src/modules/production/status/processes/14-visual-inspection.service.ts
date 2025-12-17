import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { WorklogVisualInspection } from 'src/common/entities/worklogs/worklog-15-visual-inspection.entity';
import { ProductionPlan } from 'src/common/entities/production-plan.entity';
import { ProductionTarget } from 'src/common/entities/production-target.entity';

@Injectable()
export class VisualInspectionProcessService {
  constructor(
    @InjectRepository(WorklogVisualInspection)
    private readonly visualInspectionRepository: Repository<WorklogVisualInspection>,
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

    const visualInspectionLogs = await this.visualInspectionRepository.find({
      where: {
        production: { id: productionId },
        manufactureDate: Between(projectStartDate, endDate),
      },
      order: { manufactureDate: 'ASC' },
    });

    return this.processVisualInspectionData(visualInspectionLogs, month, productionTarget, startDate, endDate);
  }

  private processVisualInspectionData(
    logs: WorklogVisualInspection[],
    month: string,
    productionTarget: ProductionTarget | null,
    monthStartDate: Date,
    monthEndDate: Date,
  ) {
    const dailyMap = new Map<
      number,
      {
        output: number;
        ncr: {
          gas: number;
          foreignMatter: number;
          scratch: number;
          dent: number;
          leakCorrosion: number;
          cellSize: number;
        };
      }
    >();

    let cumulativeOutput = 0;

    for (const log of logs) {
      const logDate = new Date(log.manufactureDate);
      const isCurrentMonth = logDate >= monthStartDate && logDate <= monthEndDate;
      const day = logDate.getDate();

      const output = Number(log.cellInputQuantity) || 0;
      cumulativeOutput += output;

      if (isCurrentMonth) {
        const current = dailyMap.get(day) || {
          output: 0,
          ncr: {
            gas: 0,
            foreignMatter: 0,
            scratch: 0,
            dent: 0,
            leakCorrosion: 0,
            cellSize: 0,
          },
        };

        current.output += output;
        current.ncr.gas += Number(log.gasDiscardQuantity) || 0;
        current.ncr.foreignMatter += Number(log.foreignMatterDiscardQuantity) || 0;
        current.ncr.scratch += Number(log.scratchDiscardQuantity) || 0;
        current.ncr.dent += Number(log.dentDiscardQuantity) || 0;
        current.ncr.leakCorrosion += Number(log.leakCorrosionDiscardQuantity) || 0;
        current.ncr.cellSize += Number(log.cellSizeDiscardQuantity) || 0;

        dailyMap.set(day, current);
      }
    }

    return this.buildResult(dailyMap, month, productionTarget, cumulativeOutput);
  }

  private buildResult(
    dailyMap: Map<
      number,
      {
        output: number;
        ncr: {
          gas: number;
          foreignMatter: number;
          scratch: number;
          dent: number;
          leakCorrosion: number;
          cellSize: number;
        };
      }
    >,
    month: string,
    productionTarget: ProductionTarget | null,
    cumulativeOutput: number,
  ) {
    const daysInMonth = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0).getDate();

    const data: Array<{
      day: number;
      output: number;
      ng: number | null;
      ncr: {
        gas: number;
        foreignMatter: number;
        scratch: number;
        dent: number;
        leakCorrosion: number;
        cellSize: number;
      } | null;
      yield: number | null;
    }> = [];

    let totalOutput = 0;
    const totalNcr = {
      gas: 0,
      foreignMatter: 0,
      scratch: 0,
      dent: 0,
      leakCorrosion: 0,
      cellSize: 0,
    };

    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = dailyMap.get(day);

      if (dayData) {
        const ngTotal =
          dayData.ncr.gas +
          dayData.ncr.foreignMatter +
          dayData.ncr.scratch +
          dayData.ncr.dent +
          dayData.ncr.leakCorrosion +
          dayData.ncr.cellSize;
        const ng = dayData.output > 0 ? ngTotal : null;
        const dayYield =
          dayData.output > 0 ? Math.round(((dayData.output - ngTotal) / dayData.output) * 100 * 100) / 100 : null;

        data.push({
          day,
          output: dayData.output,
          ng,
          ncr: dayData.output > 0 ? dayData.ncr : null,
          yield: dayYield,
        });

        totalOutput += dayData.output;
        totalNcr.gas += dayData.ncr.gas;
        totalNcr.foreignMatter += dayData.ncr.foreignMatter;
        totalNcr.scratch += dayData.ncr.scratch;
        totalNcr.dent += dayData.ncr.dent;
        totalNcr.leakCorrosion += dayData.ncr.leakCorrosion;
        totalNcr.cellSize += dayData.ncr.cellSize;
      } else {
        data.push({ day, output: 0, ng: null, ncr: null, yield: null });
      }
    }

    const totalNgSum =
      totalNcr.gas +
      totalNcr.foreignMatter +
      totalNcr.scratch +
      totalNcr.dent +
      totalNcr.leakCorrosion +
      totalNcr.cellSize;
    const totalNg = totalOutput > 0 ? totalNgSum : null;

    const targetQuantity = productionTarget?.visualInspection || null;
    const progress =
      targetQuantity && cumulativeOutput > 0 ? Math.round((cumulativeOutput / targetQuantity) * 100 * 100) / 100 : null;

    const totalYield =
      totalOutput > 0 ? Math.round(((totalOutput - totalNgSum) / totalOutput) * 100 * 100) / 100 : null;

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
