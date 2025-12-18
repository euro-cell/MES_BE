import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { WorklogVd } from 'src/common/entities/worklogs/worklog-07-vd.entity';
import { WorklogNotching } from 'src/common/entities/worklogs/worklog-06-notching.entity';
import { ProductionPlan } from 'src/common/entities/production-plan.entity';
import { ProductionTarget } from 'src/common/entities/production-target.entity';

@Injectable()
export class VdProcessService {
  constructor(
    @InjectRepository(WorklogVd)
    private readonly vdRepository: Repository<WorklogVd>,
    @InjectRepository(WorklogNotching)
    private readonly notchingRepository: Repository<WorklogNotching>,
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

    const { endDate } = this.getMonthRange(month);
    const projectStartDate = new Date(productionPlan.startDate);

    const [vdLogs, notchingLogs] = await Promise.all([
      this.vdRepository.find({
        where: {
          production: { id: productionId },
          manufactureDate: Between(projectStartDate, endDate),
        },
        order: { manufactureDate: 'ASC' },
      }),
      this.notchingRepository.find({
        where: {
          production: { id: productionId },
          manufactureDate: Between(projectStartDate, endDate),
        },
        order: { manufactureDate: 'ASC' },
      }),
    ]);

    const notchingLotMap = this.buildNotchingLotMap(notchingLogs);

    return this.processVdData(vdLogs, month, productionTarget, notchingLotMap);
  }

  private isValidLot(lot: string | null | undefined): boolean {
    if (!lot) return false;
    if (lot.length < 5) return false;
    if (lot === 'string' || lot === 'null' || lot === 'undefined') return false;
    const char4 = lot[4];
    if (char4 !== 'C' && char4 !== 'A') return false;
    return true;
  }

  private buildNotchingLotMap(logs: WorklogNotching[]): Map<string, number> {
    const lotMap = new Map<string, number>();

    for (const log of logs) {
      const notchingFields = [
        { lot: log.notchingLot1, good: log.goodQuantity1 },
        { lot: log.notchingLot2, good: log.goodQuantity2 },
        { lot: log.notchingLot3, good: log.goodQuantity3 },
        { lot: log.notchingLot4, good: log.goodQuantity4 },
        { lot: log.notchingLot5, good: log.goodQuantity5 },
      ];

      for (const field of notchingFields) {
        if (this.isValidLot(field.lot)) {
          const currentQty = lotMap.get(field.lot) || 0;
          lotMap.set(field.lot, currentQty + (Number(field.good) || 0));
        }
      }
    }

    return lotMap;
  }

  private processVdData(logs: WorklogVd[], month: string, productionTarget: ProductionTarget | null, notchingLotMap: Map<string, number>) {
    const [targetYear, targetMonth] = month.split('-').map(Number);

    const dailyMap = new Map<
      number,
      {
        cathodeOutput: number;
        anodeOutput: number;
        cathodeNotching: number;
        anodeNotching: number;
      }
    >();
    const processedLots = new Set<string>();
    const lotLastDay = new Map<string, { day: number; isCurrentMonth: boolean }>();
    const vdLotQuantityMap = new Map<string, number>();
    let cumulativeCathodeOutput = 0;
    let cumulativeAnodeOutput = 0;

    for (const log of logs) {
      const logDate = new Date(log.manufactureDate);
      const logYear = logDate.getFullYear();
      const logMonth = logDate.getMonth() + 1;
      const day = logDate.getDate();
      const isCurrentMonth = logYear === targetYear && logMonth === targetMonth;

      const current = isCurrentMonth
        ? dailyMap.get(day) || {
            cathodeOutput: 0,
            anodeOutput: 0,
            cathodeNotching: 0,
            anodeNotching: 0,
          }
        : null;

      const cathodeFields = [
        { lot: log.cathodeLot1, qty: log.cathodeInputQuantity1 },
        { lot: log.cathodeLot2, qty: log.cathodeInputQuantity2 },
        { lot: log.cathodeLot3, qty: log.cathodeInputQuantity3 },
        { lot: log.cathodeLot4, qty: log.cathodeInputQuantity4 },
        { lot: log.cathodeLot5, qty: log.cathodeInputQuantity5 },
      ];

      for (const field of cathodeFields) {
        if (this.isValidLot(field.lot)) {
          const qty = Number(field.qty) || 0;
          cumulativeCathodeOutput += qty;

          const currentVdQty = vdLotQuantityMap.get(field.lot) || 0;
          vdLotQuantityMap.set(field.lot, currentVdQty + qty);
          lotLastDay.set(field.lot, { day, isCurrentMonth });

          const notchingQty = notchingLotMap.get(field.lot) || 0;
          const newVdQty = currentVdQty + qty;

          if (isCurrentMonth && current) {
            current.cathodeOutput += qty;

            if (!processedLots.has(field.lot) && newVdQty >= notchingQty && notchingQty > 0) {
              current.cathodeNotching += notchingQty;
              processedLots.add(field.lot);
            }
          }
        }
      }

      const anodeFields = [
        { lot: log.anodeLot1, qty: log.anodeInputQuantity1 },
        { lot: log.anodeLot2, qty: log.anodeInputQuantity2 },
        { lot: log.anodeLot3, qty: log.anodeInputQuantity3 },
        { lot: log.anodeLot4, qty: log.anodeInputQuantity4 },
        { lot: log.anodeLot5, qty: log.anodeInputQuantity5 },
      ];

      for (const field of anodeFields) {
        if (this.isValidLot(field.lot)) {
          const qty = Number(field.qty) || 0;
          cumulativeAnodeOutput += qty;

          const currentVdQty = vdLotQuantityMap.get(field.lot) || 0;
          vdLotQuantityMap.set(field.lot, currentVdQty + qty);
          lotLastDay.set(field.lot, { day, isCurrentMonth });

          const notchingQty = notchingLotMap.get(field.lot) || 0;
          const newVdQty = currentVdQty + qty;

          if (isCurrentMonth && current) {
            current.anodeOutput += qty;

            if (!processedLots.has(field.lot) && newVdQty >= notchingQty && notchingQty > 0) {
              current.anodeNotching += notchingQty;
              processedLots.add(field.lot);
            }
          }
        }
      }

      if (isCurrentMonth && current) {
        dailyMap.set(day, current);
      }
    }

    for (const [lot, notchingQty] of notchingLotMap) {
      if (!processedLots.has(lot) && vdLotQuantityMap.has(lot)) {
        const lastDayInfo = lotLastDay.get(lot);
        if (lastDayInfo && lastDayInfo.isCurrentMonth) {
          const dayData = dailyMap.get(lastDayInfo.day) || {
            cathodeOutput: 0,
            anodeOutput: 0,
            cathodeNotching: 0,
            anodeNotching: 0,
          };

          if (lot.length >= 5 && lot[4] === 'C') {
            dayData.cathodeNotching += notchingQty;
          } else if (lot.length >= 5 && lot[4] === 'A') {
            dayData.anodeNotching += notchingQty;
          }

          dailyMap.set(lastDayInfo.day, dayData);
        }
      }
    }

    return this.buildResult(dailyMap, month, productionTarget, cumulativeCathodeOutput, cumulativeAnodeOutput);
  }

  private buildResult(
    dailyMap: Map<
      number,
      {
        cathodeOutput: number;
        anodeOutput: number;
        cathodeNotching: number;
        anodeNotching: number;
      }
    >,
    month: string,
    productionTarget: ProductionTarget | null,
    cumulativeCathodeOutput: number,
    cumulativeAnodeOutput: number,
  ) {
    const daysInMonth = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0).getDate();
    const data: Array<{
      day: number;
      cathodeOutput: number;
      anodeOutput: number;
      cathodeNg: number | null;
      anodeNg: number | null;
      cathodeYield: number | null;
      anodeYield: number | null;
    }> = [];
    let totalCathodeOutput = 0;
    let totalAnodeOutput = 0;
    let totalCathodeNotching = 0;
    let totalAnodeNotching = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = dailyMap.get(day) || {
        cathodeOutput: 0,
        anodeOutput: 0,
        cathodeNotching: 0,
        anodeNotching: 0,
      };

      const cathodeNg = dayData.cathodeNotching > 0 ? Math.max(0, dayData.cathodeNotching - dayData.cathodeOutput) : null;
      const anodeNg = dayData.anodeNotching > 0 ? Math.max(0, dayData.anodeNotching - dayData.anodeOutput) : null;

      const cathodeYield =
        dayData.cathodeNotching > 0 ? Math.round((dayData.cathodeOutput / dayData.cathodeNotching) * 100 * 100) / 100 : null;
      const anodeYield = dayData.anodeNotching > 0 ? Math.round((dayData.anodeOutput / dayData.anodeNotching) * 100 * 100) / 100 : null;

      data.push({
        day,
        cathodeOutput: dayData.cathodeOutput,
        anodeOutput: dayData.anodeOutput,
        cathodeNg,
        anodeNg,
        cathodeYield,
        anodeYield,
      });

      totalCathodeOutput += dayData.cathodeOutput;
      totalAnodeOutput += dayData.anodeOutput;
      totalCathodeNotching += dayData.cathodeNotching;
      totalAnodeNotching += dayData.anodeNotching;
    }

    const totalCathodeNg = totalCathodeNotching > 0 ? Math.max(0, totalCathodeNotching - totalCathodeOutput) : null;
    const totalAnodeNg = totalAnodeNotching > 0 ? Math.max(0, totalAnodeNotching - totalAnodeOutput) : null;

    const totalCathodeYield = totalCathodeNotching > 0 ? Math.round((totalCathodeOutput / totalCathodeNotching) * 100 * 100) / 100 : null;
    const totalAnodeYield = totalAnodeNotching > 0 ? Math.round((totalAnodeOutput / totalAnodeNotching) * 100 * 100) / 100 : null;

    const cathodeTargetQuantity = productionTarget?.vdCathode || null;
    const anodeTargetQuantity = productionTarget?.vdAnode || null;
    const cathodeProgress = cathodeTargetQuantity ? Math.round((cumulativeCathodeOutput / cathodeTargetQuantity) * 100 * 100) / 100 : null;
    const anodeProgress = anodeTargetQuantity ? Math.round((cumulativeAnodeOutput / anodeTargetQuantity) * 100 * 100) / 100 : null;

    return {
      data,
      total: {
        cathode: {
          totalOutput: totalCathodeOutput,
          cumulativeOutput: cumulativeCathodeOutput,
          targetQuantity: cathodeTargetQuantity,
          progress: cathodeProgress,
          totalNg: totalCathodeNg,
          totalYield: totalCathodeYield,
        },
        anode: {
          totalOutput: totalAnodeOutput,
          cumulativeOutput: cumulativeAnodeOutput,
          targetQuantity: anodeTargetQuantity,
          progress: anodeProgress,
          totalNg: totalAnodeNg,
          totalYield: totalAnodeYield,
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
