import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { WorklogCoating } from 'src/common/entities/worklogs/worklog-03-coating.entity';
import { ProductionPlan } from 'src/common/entities/production-plan.entity';
import { ProductionTarget } from 'src/common/entities/production-target.entity';

@Injectable()
export class CoatingProcessService {
  constructor(
    @InjectRepository(WorklogCoating)
    private readonly coatingRepository: Repository<WorklogCoating>,
    @InjectRepository(ProductionPlan)
    private readonly productionPlanRepository: Repository<ProductionPlan>,
    @InjectRepository(ProductionTarget)
    private readonly productionTargetRepository: Repository<ProductionTarget>,
  ) {}

  async getMonthlyData(productionId: number, month: string, type: 'cathode' | 'anode') {
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
    const targetChar = type === 'cathode' ? 'C' : 'A';
    const coatingLogs = await this.coatingRepository.find({
      where: {
        production: { id: productionId },
        manufactureDate: Between(projectStartDate, endDate),
      },
      order: { manufactureDate: 'ASC' },
    });

    const singleLotQuantityMap = this.buildSingleLotQuantityMap(coatingLogs, targetChar);
    const singleData = this.processSingleCoatingData(coatingLogs, targetChar, month, productionTarget, type, startDate, endDate);
    const doubleData = this.processDoubleCoatingData(coatingLogs, targetChar, month, productionTarget, type, singleLotQuantityMap, startDate, endDate);

    return { single: singleData, double: doubleData };
  }

  private buildSingleLotQuantityMap(logs: WorklogCoating[], targetChar: string): Map<string, number> {
    const lotQuantityMap = new Map<string, number>();

    for (const log of logs) {
      const coatingFields = [
        { lot: log.coatingLot1, quantity: log.productionQuantity1, side: log.coatingSide1 },
        { lot: log.coatingLot2, quantity: log.productionQuantity2, side: log.coatingSide2 },
        { lot: log.coatingLot3, quantity: log.productionQuantity3, side: log.coatingSide3 },
        { lot: log.coatingLot4, quantity: log.productionQuantity4, side: log.coatingSide4 },
      ];

      for (const field of coatingFields) {
        if (field.lot && field.lot.length >= 5 && field.lot[4] === targetChar && field.side === '단면') {
          const currentQty = lotQuantityMap.get(field.lot) || 0;
          lotQuantityMap.set(field.lot, currentQty + (Number(field.quantity) || 0));
        }
      }
    }
    return lotQuantityMap;
  }

  private extractSingleLotFromDouble(doubleLot: string): string | null {
    const bIndex = doubleLot.lastIndexOf('B');
    if (bIndex === -1) return null;
    return doubleLot.substring(0, bIndex);
  }

  private processSingleCoatingData(
    logs: WorklogCoating[],
    targetChar: string,
    month: string,
    productionTarget: ProductionTarget | null,
    type: 'cathode' | 'anode',
    monthStartDate: Date,
    monthEndDate: Date,
  ) {
    const dailyMap = new Map<number, { output: number; ng: number }>();
    let cumulativeOutput = 0;

    for (const log of logs) {
      const logDate = new Date(log.manufactureDate);
      const isCurrentMonth = logDate >= monthStartDate && logDate <= monthEndDate;
      const day = logDate.getDate();

      const coatingFields = [
        { lot: log.coatingLot1, quantity: log.productionQuantity1, side: log.coatingSide1 },
        { lot: log.coatingLot2, quantity: log.productionQuantity2, side: log.coatingSide2 },
        { lot: log.coatingLot3, quantity: log.productionQuantity3, side: log.coatingSide3 },
        { lot: log.coatingLot4, quantity: log.productionQuantity4, side: log.coatingSide4 },
      ];

      for (const field of coatingFields) {
        if (field.lot && field.lot.length >= 5 && field.lot[4] === targetChar && field.side === '단면') {
          const qty = Number(field.quantity) || 0;
          cumulativeOutput += qty;
          if (isCurrentMonth) {
            const current = dailyMap.get(day) || { output: 0, ng: 0 };
            current.output += qty;
            dailyMap.set(day, current);
          }
        }
      }
    }
    return this.buildResult(dailyMap, month, productionTarget, type, '단면', cumulativeOutput);
  }

  private processDoubleCoatingData(
    logs: WorklogCoating[],
    targetChar: string,
    month: string,
    productionTarget: ProductionTarget | null,
    type: 'cathode' | 'anode',
    singleLotQuantityMap: Map<string, number>,
    monthStartDate: Date,
    monthEndDate: Date,
  ) {
    const dailyMap = new Map<number, { output: number; ng: number }>();
    const doubleLotQuantityMap = new Map<string, number>();
    const singleLotLastDay = new Map<string, { day: number; isCurrentMonth: boolean }>();
    const processedSingleLots = new Set<string>();
    let cumulativeOutput = 0;

    for (const log of logs) {
      const logDate = new Date(log.manufactureDate);
      const isCurrentMonth = logDate >= monthStartDate && logDate <= monthEndDate;
      const day = logDate.getDate();

      const coatingFields = [
        { lot: log.coatingLot1, quantity: log.productionQuantity1, side: log.coatingSide1 },
        { lot: log.coatingLot2, quantity: log.productionQuantity2, side: log.coatingSide2 },
        { lot: log.coatingLot3, quantity: log.productionQuantity3, side: log.coatingSide3 },
        { lot: log.coatingLot4, quantity: log.productionQuantity4, side: log.coatingSide4 },
      ];

      for (const field of coatingFields) {
        if (field.lot && field.lot.length >= 5 && field.lot[4] === targetChar && field.side === '양면') {
          const qty = Number(field.quantity) || 0;
          cumulativeOutput += qty;

          if (isCurrentMonth) {
            const current = dailyMap.get(day) || { output: 0, ng: 0 };
            current.output += qty;
            dailyMap.set(day, current);
          }

          const singleLot = this.extractSingleLotFromDouble(field.lot);

          if (singleLot) {
            const currentDoubleQty = doubleLotQuantityMap.get(singleLot) || 0;
            const newDoubleQty = currentDoubleQty + qty;
            doubleLotQuantityMap.set(singleLot, newDoubleQty);

            singleLotLastDay.set(singleLot, { day, isCurrentMonth });

            const singleQty = singleLotQuantityMap.get(singleLot) || 0;

            if (!processedSingleLots.has(singleLot) && newDoubleQty >= singleQty && singleQty > 0) {
              if (isCurrentMonth) {
                const current = dailyMap.get(day) || { output: 0, ng: 0 };
                const ng = singleQty - newDoubleQty;
                if (ng > 0) {
                  current.ng += ng;
                  dailyMap.set(day, current);
                }
              }
              processedSingleLots.add(singleLot);
            }
          }
        }
      }
    }

    for (const [singleLot, singleQty] of singleLotQuantityMap) {
      if (!processedSingleLots.has(singleLot)) {
        const doubleQty = doubleLotQuantityMap.get(singleLot) || 0;
        const ng = singleQty - doubleQty;
        const lastDayInfo = singleLotLastDay.get(singleLot);

        if (ng > 0 && lastDayInfo && lastDayInfo.isCurrentMonth) {
          const dayData = dailyMap.get(lastDayInfo.day) || { output: 0, ng: 0 };
          dayData.ng += ng;
          dailyMap.set(lastDayInfo.day, dayData);
        }
      }
    }
    return this.buildResultWithNg(dailyMap, month, productionTarget, type, '양면', 0, cumulativeOutput);
  }

  private buildResult(
    dailyMap: Map<number, { output: number; ng: number }>,
    month: string,
    productionTarget: ProductionTarget | null,
    type: 'cathode' | 'anode',
    coatingType: '단면' | '양면',
    cumulativeOutput: number,
  ) {
    const daysInMonth = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0).getDate();
    const data: Array<{ day: number; output: number; ng: number | null; yield: number | null }> = [];
    let totalOutput = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = dailyMap.get(day) || { output: 0, ng: 0 };
      data.push({ day, output: dayData.output, ng: null, yield: null });
      totalOutput += dayData.output;
    }

    const targetField =
      coatingType === '단면'
        ? type === 'cathode'
          ? 'coatingSingleCathode'
          : 'coatingSingleAnode'
        : type === 'cathode'
          ? 'coatingDoubleCathode'
          : 'coatingDoubleAnode';

    const targetQuantity = productionTarget?.[targetField] || null;
    const progress = targetQuantity ? Math.round((cumulativeOutput / targetQuantity) * 100 * 100) / 100 : null;

    return {
      data,
      total: { totalOutput, targetQuantity, progress, totalNg: null, totalYield: null },
    };
  }

  private buildResultWithNg(
    dailyMap: Map<number, { output: number; ng: number }>,
    month: string,
    productionTarget: ProductionTarget | null,
    type: 'cathode' | 'anode',
    coatingType: '단면' | '양면',
    remainingNg: number,
    cumulativeOutput: number,
  ) {
    const daysInMonth = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0).getDate();
    const data: Array<{ day: number; output: number; ng: number | null; yield: number | null }> = [];
    let totalOutput = 0;
    let totalNg = remainingNg;

    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = dailyMap.get(day) || { output: 0, ng: 0 };
      const dayNg = dayData.ng > 0 ? dayData.ng : null;
      const dayYield =
        dayData.output + dayData.ng > 0 ? Math.round((dayData.output / (dayData.output + dayData.ng)) * 100 * 100) / 100 : null;
      data.push({ day, output: dayData.output, ng: dayNg, yield: dayYield });
      totalOutput += dayData.output;
      totalNg += dayData.ng;
    }

    const targetField =
      coatingType === '단면'
        ? type === 'cathode'
          ? 'coatingSingleCathode'
          : 'coatingSingleAnode'
        : type === 'cathode'
          ? 'coatingDoubleCathode'
          : 'coatingDoubleAnode';

    const targetQuantity = productionTarget?.[targetField] || null;
    const progress = targetQuantity ? Math.round((cumulativeOutput / targetQuantity) * 100 * 100) / 100 : null;

    const totalYield = totalOutput + totalNg > 0 ? Math.round((totalOutput / (totalOutput + totalNg)) * 100 * 100) / 100 : null;

    return {
      data,
      total: { totalOutput, targetQuantity, progress, totalNg, totalYield },
    };
  }

  private getMonthRange(month: string): { startDate: Date; endDate: Date } {
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);
    return { startDate, endDate };
  }
}
