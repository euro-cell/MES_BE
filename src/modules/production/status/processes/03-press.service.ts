import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { WorklogPress } from 'src/common/entities/worklogs/worklog-04-press.entity';
import { WorklogCoating } from 'src/common/entities/worklogs/worklog-03-coating.entity';
import { ProductionPlan } from 'src/common/entities/production-plan.entity';
import { ProductionTarget } from 'src/common/entities/production-target.entity';

@Injectable()
export class PressProcessService {
  constructor(
    @InjectRepository(WorklogPress)
    private readonly pressRepository: Repository<WorklogPress>,
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

    const [pressLogs, coatingLogs] = await Promise.all([
      this.pressRepository.find({
        where: {
          production: { id: productionId },
          manufactureDate: Between(projectStartDate, endDate),
        },
        order: { manufactureDate: 'ASC' },
      }),
      this.coatingRepository.find({
        where: {
          production: { id: productionId },
          manufactureDate: Between(projectStartDate, endDate),
        },
        order: { manufactureDate: 'ASC' },
      }),
    ]);

    const doubleLotQuantityMap = this.buildDoubleLotQuantityMap(coatingLogs, targetChar);

    return this.processPressData(pressLogs, targetChar, month, productionTarget, type, doubleLotQuantityMap, startDate, endDate);
  }

  private buildDoubleLotQuantityMap(logs: WorklogCoating[], targetChar: string): Map<string, number> {
    const lotQuantityMap = new Map<string, number>();

    for (const log of logs) {
      const coatingFields = [
        { lot: log.coatingLot1, quantity: log.productionQuantity1, side: log.coatingSide1 },
        { lot: log.coatingLot2, quantity: log.productionQuantity2, side: log.coatingSide2 },
        { lot: log.coatingLot3, quantity: log.productionQuantity3, side: log.coatingSide3 },
        { lot: log.coatingLot4, quantity: log.productionQuantity4, side: log.coatingSide4 },
      ];

      for (const field of coatingFields) {
        if (field.lot && field.lot.length >= 5 && field.lot[4] === targetChar && field.side === '양면') {
          const currentQty = lotQuantityMap.get(field.lot) || 0;
          lotQuantityMap.set(field.lot, currentQty + (Number(field.quantity) || 0));
        }
      }
    }
    return lotQuantityMap;
  }

  private extractDoubleLotFromPress(pressLot: string): string | null {
    const bIndex = pressLot.lastIndexOf('B');
    if (bIndex === -1) return null;

    const afterB = pressLot.substring(bIndex + 1);
    if (afterB.length < 2) return null;

    return pressLot.substring(0, pressLot.length - 1);
  }

  private processPressData(
    logs: WorklogPress[],
    targetChar: string,
    month: string,
    productionTarget: ProductionTarget | null,
    type: 'cathode' | 'anode',
    doubleLotQuantityMap: Map<string, number>,
    monthStartDate: Date,
    monthEndDate: Date,
  ) {
    const dailyMap = new Map<number, { output: number; inputQty: number }>();
    const pressLotQuantityMap = new Map<string, number>();
    const doubleLotLastDay = new Map<string, { day: number; isCurrentMonth: boolean }>();
    const processedDoubleLots = new Set<string>();
    let cumulativeOutput = 0;

    for (const log of logs) {
      const logDate = new Date(log.manufactureDate);
      const isCurrentMonth = logDate >= monthStartDate && logDate <= monthEndDate;
      const day = logDate.getDate();

      const pressFields = [
        { pressLot: log.pressLot1, pressQty: log.pressQuantity1 },
        { pressLot: log.pressLot2, pressQty: log.pressQuantity2 },
        { pressLot: log.pressLot3, pressQty: log.pressQuantity3 },
        { pressLot: log.pressLot4, pressQty: log.pressQuantity4 },
        { pressLot: log.pressLot5, pressQty: log.pressQuantity5 },
      ];

      for (const field of pressFields) {
        if (field.pressLot && field.pressLot.length >= 5 && field.pressLot[4] === targetChar) {
          const pressQty = Number(field.pressQty) || 0;
          cumulativeOutput += pressQty;

          if (isCurrentMonth) {
            const current = dailyMap.get(day) || { output: 0, inputQty: 0 };
            current.output += pressQty;
            dailyMap.set(day, current);
          }

          const doubleLot = this.extractDoubleLotFromPress(field.pressLot);

          if (doubleLot) {
            const currentPressQty = pressLotQuantityMap.get(doubleLot) || 0;
            const newPressQty = currentPressQty + pressQty;
            pressLotQuantityMap.set(doubleLot, newPressQty);

            doubleLotLastDay.set(doubleLot, { day, isCurrentMonth });

            const doubleQty = doubleLotQuantityMap.get(doubleLot) || 0;

            if (!processedDoubleLots.has(doubleLot) && newPressQty >= doubleQty && doubleQty > 0) {
              if (isCurrentMonth) {
                const current = dailyMap.get(day) || { output: 0, inputQty: 0 };
                current.inputQty += doubleQty;
                dailyMap.set(day, current);
              }
              processedDoubleLots.add(doubleLot);
            }
          }
        }
      }
    }

    for (const [doubleLot, doubleQty] of doubleLotQuantityMap) {
      if (!processedDoubleLots.has(doubleLot)) {
        const lastDayInfo = doubleLotLastDay.get(doubleLot);

        if (lastDayInfo && lastDayInfo.isCurrentMonth) {
          const dayData = dailyMap.get(lastDayInfo.day) || { output: 0, inputQty: 0 };
          dayData.inputQty += doubleQty;
          dailyMap.set(lastDayInfo.day, dayData);
        }
      }
    }

    return this.buildResult(dailyMap, month, productionTarget, type, cumulativeOutput);
  }

  private buildResult(
    dailyMap: Map<number, { output: number; inputQty: number }>,
    month: string,
    productionTarget: ProductionTarget | null,
    type: 'cathode' | 'anode',
    cumulativeOutput: number,
  ) {
    const daysInMonth = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0).getDate();
    const data: Array<{ day: number; output: number; ng: number | null; yield: number | null }> = [];
    let totalOutput = 0;
    let totalInputQty = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = dailyMap.get(day) || { output: 0, inputQty: 0 };
      const dayNg = dayData.inputQty > dayData.output ? dayData.inputQty - dayData.output : null;
      const dayYield = dayData.inputQty > 0 ? Math.round((dayData.output / dayData.inputQty) * 100 * 100) / 100 : null;
      data.push({ day, output: dayData.output, ng: dayNg, yield: dayYield });
      totalOutput += dayData.output;
      totalInputQty += dayData.inputQty;
    }

    const targetField = type === 'cathode' ? 'pressCathode' : 'pressAnode';
    const targetQuantity = productionTarget?.[targetField] || null;
    const progress = targetQuantity ? Math.round((cumulativeOutput / targetQuantity) * 100 * 100) / 100 : null;
    const totalNg = totalInputQty > totalOutput ? totalInputQty - totalOutput : null;
    const totalYield = totalInputQty > 0 ? Math.round((totalOutput / totalInputQty) * 100 * 100) / 100 : null;

    return {
      data,
      total: { totalOutput, cumulativeOutput, targetQuantity, progress, totalNg, totalYield },
    };
  }

  private getMonthRange(month: string): { startDate: Date; endDate: Date } {
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);
    return { startDate, endDate };
  }
}
