import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { WorklogNotching } from 'src/common/entities/worklogs/worklog-06-notching.entity';
import { WorklogPress } from 'src/common/entities/worklogs/worklog-04-press.entity';
import { ProductionPlan } from 'src/common/entities/production-plan.entity';
import { ProductionTarget } from 'src/common/entities/production-target.entity';

@Injectable()
export class NotchingProcessService {
  constructor(
    @InjectRepository(WorklogNotching)
    private readonly notchingRepository: Repository<WorklogNotching>,
    @InjectRepository(WorklogPress)
    private readonly pressRepository: Repository<WorklogPress>,
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

    // TODO: 슬리팅 공정이 있는 경우 슬리팅에서 생산량 가져오기
    // const hasSlitting = await this.checkSlittingProcess(productionId);
    // if (hasSlitting) {
    //   return this.processWithSlitting(productionId, month, type, ...);
    // }

    const [notchingLogs, pressLogs] = await Promise.all([
      this.notchingRepository.find({
        where: {
          production: { id: productionId },
          manufactureDate: Between(projectStartDate, endDate),
        },
        order: { manufactureDate: 'ASC' },
      }),
      this.pressRepository.find({
        where: {
          production: { id: productionId },
          manufactureDate: Between(projectStartDate, endDate),
        },
        order: { manufactureDate: 'ASC' },
      }),
    ]);

    const pressLotQuantityMap = this.buildPressLotQuantityMap(pressLogs, targetChar);

    return this.processNotchingData(notchingLogs, targetChar, month, productionTarget, type, pressLotQuantityMap, startDate, endDate);
  }

  private buildPressLotQuantityMap(logs: WorklogPress[], targetChar: string): Map<string, number> {
    const lotQuantityMap = new Map<string, number>();

    for (const log of logs) {
      const pressFields = [
        { lot: log.pressLot1, quantity: log.pressQuantity1 },
        { lot: log.pressLot2, quantity: log.pressQuantity2 },
        { lot: log.pressLot3, quantity: log.pressQuantity3 },
        { lot: log.pressLot4, quantity: log.pressQuantity4 },
        { lot: log.pressLot5, quantity: log.pressQuantity5 },
      ];

      for (const field of pressFields) {
        if (field.lot && field.lot.length >= 5 && field.lot[4] === targetChar) {
          const currentQty = lotQuantityMap.get(field.lot) || 0;
          lotQuantityMap.set(field.lot, currentQty + (Number(field.quantity) || 0));
        }
      }
    }
    return lotQuantityMap;
  }

  private processNotchingData(
    logs: WorklogNotching[],
    targetChar: string,
    month: string,
    productionTarget: ProductionTarget | null,
    type: 'cathode' | 'anode',
    pressLotQuantityMap: Map<string, number>,
    monthStartDate: Date,
    monthEndDate: Date,
  ) {
    const dailyMap = new Map<number, { good: number; defect: number; notchingLengthM: number; pressInputM: number }>();
    const notchingLengthMap = new Map<string, number>();
    const pressLotLastDay = new Map<string, { day: number; isCurrentMonth: boolean }>();
    const processedPressLots = new Set<string>();
    let cumulativeOutput = 0;

    for (const log of logs) {
      const logDate = new Date(log.manufactureDate);
      const isCurrentMonth = logDate >= monthStartDate && logDate <= monthEndDate;
      const day = logDate.getDate();

      const notchingFields = [
        { pressLot: log.pressLot1, good: log.goodQuantity1, defect: log.defectQuantity1, wide: log.wide1 },
        { pressLot: log.pressLot2, good: log.goodQuantity2, defect: log.defectQuantity2, wide: log.wide2 },
        { pressLot: log.pressLot3, good: log.goodQuantity3, defect: log.defectQuantity3, wide: log.wide3 },
        { pressLot: log.pressLot4, good: log.goodQuantity4, defect: log.defectQuantity4, wide: log.wide4 },
        { pressLot: log.pressLot5, good: log.goodQuantity5, defect: log.defectQuantity5, wide: log.wide5 },
      ];

      for (const field of notchingFields) {
        if (field.pressLot && field.pressLot.length >= 5 && field.pressLot[4] === targetChar) {
          const good = Number(field.good) || 0;
          const defect = Number(field.defect) || 0;
          const wide = Number(field.wide) || 0;
          const notchingLengthM = (good * wide) / 1000;

          cumulativeOutput += good;

          if (isCurrentMonth) {
            const current = dailyMap.get(day) || { good: 0, defect: 0, notchingLengthM: 0, pressInputM: 0 };
            current.good += good;
            current.defect += defect;
            current.notchingLengthM += notchingLengthM;
            dailyMap.set(day, current);
          }

          const currentLength = notchingLengthMap.get(field.pressLot) || 0;
          notchingLengthMap.set(field.pressLot, currentLength + notchingLengthM);

          pressLotLastDay.set(field.pressLot, { day, isCurrentMonth });

          const pressQty = pressLotQuantityMap.get(field.pressLot) || 0;
          const newNotchingLength = currentLength + notchingLengthM;

          if (!processedPressLots.has(field.pressLot) && newNotchingLength >= pressQty && pressQty > 0) {
            if (isCurrentMonth) {
              const current = dailyMap.get(day) || { good: 0, defect: 0, notchingLengthM: 0, pressInputM: 0 };
              current.pressInputM += pressQty;
              dailyMap.set(day, current);
            }
            processedPressLots.add(field.pressLot);
          }
        }
      }
    }

    for (const [pressLot, pressQty] of pressLotQuantityMap) {
      if (!processedPressLots.has(pressLot)) {
        const lastDayInfo = pressLotLastDay.get(pressLot);

        if (lastDayInfo && lastDayInfo.isCurrentMonth) {
          const dayData = dailyMap.get(lastDayInfo.day) || { good: 0, defect: 0, notchingLengthM: 0, pressInputM: 0 };
          dayData.pressInputM += pressQty;
          dailyMap.set(lastDayInfo.day, dayData);
        }
      }
    }

    return this.buildResult(dailyMap, month, productionTarget, type, cumulativeOutput);
  }

  private buildResult(
    dailyMap: Map<number, { good: number; defect: number; notchingLengthM: number; pressInputM: number }>,
    month: string,
    productionTarget: ProductionTarget | null,
    type: 'cathode' | 'anode',
    cumulativeOutput: number,
  ) {
    const daysInMonth = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0).getDate();
    const data: Array<{ day: number; output: number; ng: number | null; yield: number | null }> = [];
    let totalOutput = 0;
    let totalDefect = 0;
    let totalNotchingLengthM = 0;
    let totalPressInputM = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = dailyMap.get(day) || { good: 0, defect: 0, notchingLengthM: 0, pressInputM: 0 };
      const dayNg = dayData.defect > 0 ? dayData.defect : null;
      const dayYield = dayData.pressInputM > 0 ? Math.round((dayData.notchingLengthM / dayData.pressInputM) * 100 * 100) / 100 : null;
      data.push({ day, output: dayData.good, ng: dayNg, yield: dayYield });
      totalOutput += dayData.good;
      totalDefect += dayData.defect;
      totalNotchingLengthM += dayData.notchingLengthM;
      totalPressInputM += dayData.pressInputM;
    }

    const targetField = type === 'cathode' ? 'notchingCathode' : 'notchingAnode';
    const targetQuantity = productionTarget?.[targetField] || null;
    const progress = targetQuantity ? Math.round((cumulativeOutput / targetQuantity) * 100 * 100) / 100 : null;
    const totalYield = totalPressInputM > 0 ? Math.round((totalNotchingLengthM / totalPressInputM) * 100 * 100) / 100 : null;

    return {
      data,
      total: { totalOutput, targetQuantity, progress, totalNg: totalDefect > 0 ? totalDefect : null, totalYield },
    };
  }

  private getMonthRange(month: string): { startDate: Date; endDate: Date } {
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);
    return { startDate, endDate };
  }
}
