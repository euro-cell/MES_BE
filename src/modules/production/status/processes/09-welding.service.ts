import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { WorklogWelding } from 'src/common/entities/worklogs/worklog-10-welding.entity';
import { ProductionPlan } from 'src/common/entities/production-plan.entity';
import { ProductionTarget } from 'src/common/entities/production-target.entity';

@Injectable()
export class WeldingProcessService {
  constructor(
    @InjectRepository(WorklogWelding)
    private readonly weldingRepository: Repository<WorklogWelding>,
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

    const weldingLogs = await this.weldingRepository.find({
      where: {
        production: { id: productionId },
        manufactureDate: Between(startDate, endDate),
      },
      order: { manufactureDate: 'ASC' },
    });

    return this.processWeldingData(weldingLogs, month, productionTarget);
  }

  private parseNcrFromDefectRemark(defectRemark: string | null): {
    burning: number;
    align: number;
    etc: number;
  } {
    const result = { burning: 0, align: 0, etc: 0 };
    if (!defectRemark) return result;

    const countCellNumbers = (value: string): number => {
      if (!value || !value.trim()) return 0;
      return value.split(',').filter((v) => v.trim()).length;
    };

    const burningMatch = defectRemark.match(/소착\s*:\s*([^\n]*)/);
    if (burningMatch) result.burning = countCellNumbers(burningMatch[1]);

    const alignMatch = defectRemark.match(/Align\s*:\s*([^\n]*)/i);
    if (alignMatch) result.align = countCellNumbers(alignMatch[1]);

    const etcMatch = defectRemark.match(/기타\s*:\s*([^\n]*)/);
    if (etcMatch) result.etc = countCellNumbers(etcMatch[1]);

    return result;
  }

  private processWeldingData(logs: WorklogWelding[], month: string, productionTarget: ProductionTarget | null) {
    const dailyMap = new Map<
      number,
      {
        preWelding: {
          work: number;
          ncr: { burning: number; align: number; etc: number };
        };
        mainWelding: {
          work: number;
          hiPot: number;
          taping: number;
          ncr: { burning: number; align: number; etc: number };
        };
      }
    >();

    for (const log of logs) {
      const day = new Date(log.manufactureDate).getDate();
      const current = dailyMap.get(day) || {
        preWelding: {
          work: 0,
          ncr: { burning: 0, align: 0, etc: 0 },
        },
        mainWelding: {
          work: 0,
          hiPot: 0,
          taping: 0,
          ncr: { burning: 0, align: 0, etc: 0 },
        },
      };

      // 프리웰딩
      current.preWelding.work += Number(log.preWeldingWorkQuantity) || 0;
      const preNcr = this.parseNcrFromDefectRemark(log.preWeldingDefectRemark);
      current.preWelding.ncr.burning += preNcr.burning;
      current.preWelding.ncr.align += preNcr.align;
      current.preWelding.ncr.etc += preNcr.etc;

      // 메인웰딩
      current.mainWelding.work += Number(log.mainWeldingWorkQuantity) || 0;
      current.mainWelding.hiPot += Number(log.hipot2DefectQuantity) || 0;
      current.mainWelding.taping += Number(log.tapingDefectQuantity) || 0;
      const mainNcr = this.parseNcrFromDefectRemark(log.mainWeldingDefectRemark);
      current.mainWelding.ncr.burning += mainNcr.burning;
      current.mainWelding.ncr.align += mainNcr.align;
      current.mainWelding.ncr.etc += mainNcr.etc;

      dailyMap.set(day, current);
    }

    return this.buildResult(dailyMap, month, productionTarget);
  }

  private buildResult(
    dailyMap: Map<
      number,
      {
        preWelding: {
          work: number;
          ncr: { burning: number; align: number; etc: number };
        };
        mainWelding: {
          work: number;
          hiPot: number;
          taping: number;
          ncr: { burning: number; align: number; etc: number };
        };
      }
    >,
    month: string,
    productionTarget: ProductionTarget | null,
  ) {
    const daysInMonth = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0).getDate();

    const preWeldingData: Array<{
      day: number;
      output: number;
      ng: number | null;
      ncr: { burning: number; align: number; etc: number } | null;
      yield: number | null;
    }> = [];

    const mainWeldingData: Array<{
      day: number;
      output: number;
      ng: number | null;
      ncr: { hiPot: number; burning: number; align: number; taping: number; etc: number } | null;
      yield: number | null;
    }> = [];

    let totalPreWeldingOutput = 0;
    let totalMainWeldingOutput = 0;
    const totalPreNcr = { burning: 0, align: 0, etc: 0 };
    const totalMainNcr = { hiPot: 0, burning: 0, align: 0, taping: 0, etc: 0 };

    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = dailyMap.get(day);

      if (dayData) {
        // 프리웰딩
        const preNgTotal = dayData.preWelding.ncr.burning + dayData.preWelding.ncr.align + dayData.preWelding.ncr.etc;
        const preYield = dayData.preWelding.work > 0 ? Math.round(((dayData.preWelding.work - preNgTotal) / dayData.preWelding.work) * 100 * 100) / 100 : null;
        preWeldingData.push({
          day,
          output: dayData.preWelding.work,
          ng: dayData.preWelding.work > 0 ? preNgTotal : null,
          ncr: dayData.preWelding.work > 0 ? dayData.preWelding.ncr : null,
          yield: preYield,
        });

        // 메인웰딩
        const mainNgTotal =
          dayData.mainWelding.hiPot +
          dayData.mainWelding.ncr.burning +
          dayData.mainWelding.ncr.align +
          dayData.mainWelding.taping +
          dayData.mainWelding.ncr.etc;
        const mainYield = dayData.mainWelding.work > 0 ? Math.round(((dayData.mainWelding.work - mainNgTotal) / dayData.mainWelding.work) * 100 * 100) / 100 : null;
        mainWeldingData.push({
          day,
          output: dayData.mainWelding.work,
          ng: dayData.mainWelding.work > 0 ? mainNgTotal : null,
          ncr: dayData.mainWelding.work > 0
            ? {
                hiPot: dayData.mainWelding.hiPot,
                burning: dayData.mainWelding.ncr.burning,
                align: dayData.mainWelding.ncr.align,
                taping: dayData.mainWelding.taping,
                etc: dayData.mainWelding.ncr.etc,
              }
            : null,
          yield: mainYield,
        });

        totalPreWeldingOutput += dayData.preWelding.work;
        totalMainWeldingOutput += dayData.mainWelding.work;

        totalPreNcr.burning += dayData.preWelding.ncr.burning;
        totalPreNcr.align += dayData.preWelding.ncr.align;
        totalPreNcr.etc += dayData.preWelding.ncr.etc;

        totalMainNcr.hiPot += dayData.mainWelding.hiPot;
        totalMainNcr.burning += dayData.mainWelding.ncr.burning;
        totalMainNcr.align += dayData.mainWelding.ncr.align;
        totalMainNcr.taping += dayData.mainWelding.taping;
        totalMainNcr.etc += dayData.mainWelding.ncr.etc;
      } else {
        preWeldingData.push({ day, output: 0, ng: null, ncr: null, yield: null });
        mainWeldingData.push({ day, output: 0, ng: null, ncr: null, yield: null });
      }
    }

    const totalPreNgSum = totalPreNcr.burning + totalPreNcr.align + totalPreNcr.etc;
    const totalMainNgSum =
      totalMainNcr.hiPot + totalMainNcr.burning + totalMainNcr.align + totalMainNcr.taping + totalMainNcr.etc;

    const preWeldingTargetQuantity = productionTarget?.preWelding || null;
    const mainWeldingTargetQuantity = productionTarget?.mainWelding || null;

    const preWeldingProgress =
      preWeldingTargetQuantity && totalPreWeldingOutput > 0
        ? Math.round((totalPreWeldingOutput / preWeldingTargetQuantity) * 100 * 100) / 100
        : null;
    const mainWeldingProgress =
      mainWeldingTargetQuantity && totalMainWeldingOutput > 0
        ? Math.round((totalMainWeldingOutput / mainWeldingTargetQuantity) * 100 * 100) / 100
        : null;

    const preWeldingYield =
      totalPreWeldingOutput > 0
        ? Math.round(((totalPreWeldingOutput - totalPreNgSum) / totalPreWeldingOutput) * 100 * 100) / 100
        : null;
    const mainWeldingYield =
      totalMainWeldingOutput > 0
        ? Math.round(((totalMainWeldingOutput - totalMainNgSum) / totalMainWeldingOutput) * 100 * 100) / 100
        : null;

    return {
      preWelding: {
        data: preWeldingData,
        total: {
          totalOutput: totalPreWeldingOutput,
          targetQuantity: preWeldingTargetQuantity,
          progress: preWeldingProgress,
          totalNg: totalPreWeldingOutput > 0 ? totalPreNgSum : null,
          ncr: totalPreWeldingOutput > 0 ? totalPreNcr : null,
          totalYield: preWeldingYield,
        },
      },
      mainWelding: {
        data: mainWeldingData,
        total: {
          totalOutput: totalMainWeldingOutput,
          targetQuantity: mainWeldingTargetQuantity,
          progress: mainWeldingProgress,
          totalNg: totalMainWeldingOutput > 0 ? totalMainNgSum : null,
          ncr: totalMainWeldingOutput > 0 ? totalMainNcr : null,
          totalYield: mainWeldingYield,
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
