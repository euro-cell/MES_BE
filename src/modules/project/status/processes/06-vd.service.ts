import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { WorklogVd } from 'src/common/entities/worklog/worklog-07-vd.entity';
import { WorklogNotching } from 'src/common/entities/worklog/worklog-06-notching.entity';
import { ProjectPlan } from 'src/common/entities/project/project-plan.entity';
import { ProjectTarget } from 'src/common/entities/project/project-target.entity';

@Injectable()
export class VdProcessService {
  constructor(
    @InjectRepository(WorklogVd)
    private readonly vdRepository: Repository<WorklogVd>,
    @InjectRepository(WorklogNotching)
    private readonly notchingRepository: Repository<WorklogNotching>,
    @InjectRepository(ProjectPlan)
    private readonly projectPlanRepository: Repository<ProjectPlan>,
    @InjectRepository(ProjectTarget)
    private readonly projectTargetRepository: Repository<ProjectTarget>,
  ) {}

  async getMonthlyData(projectId: number, month: string) {
    const [productionPlan, productionTarget] = await Promise.all([
      this.projectPlanRepository.findOne({
        where: { project: { id: projectId } },
      }),
      this.projectTargetRepository.findOne({
        where: { project: { id: projectId } },
      }),
    ]);

    if (!productionPlan) throw new NotFoundException('생산 계획이 존재하지 않습니다.');

    const { endDate } = this.getMonthRange(month);
    const projectStartDate = new Date(productionPlan.startDate);

    const [vdLogs, notchingLogs] = await Promise.all([
      this.vdRepository.find({
        where: {
          project: { id: projectId },
          manufactureDate: Between(projectStartDate, endDate),
        },
        order: { manufactureDate: 'ASC' },
      }),
      this.notchingRepository.find({
        where: {
          project: { id: projectId },
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

  private processVdData(logs: WorklogVd[], month: string, productionTarget: ProjectTarget | null, notchingLotMap: Map<string, number>) {
    const [targetYear, targetMonth] = month.split('-').map(Number);

    const dailyMap = new Map<number, { cathodeOutput: number; anodeOutput: number; cathodeNotching: number; anodeNotching: number }>();
    // lot별 { totalQty(전체), currentMonthQty(이번달), dayQty(날짜별), isCathode }
    const lotMeta = new Map<string, { totalQty: number; dayQty: Map<number, number>; isCathode: boolean }>();
    let cumulativeCathodeOutput = 0;
    let cumulativeAnodeOutput = 0;

    // 1패스: output 집계 + lotMeta 구축
    for (const log of logs) {
      const logDate = new Date(log.manufactureDate);
      const logYear = logDate.getFullYear();
      const logMonth = logDate.getMonth() + 1;
      const day = logDate.getDate();
      const isCurrentMonth = logYear === targetYear && logMonth === targetMonth;

      const allFields = [
        { lot: log.upperLot11, qty: log.upperLotQty11 },
        { lot: log.upperLot12, qty: log.upperLotQty12 },
        { lot: log.upperLot13, qty: log.upperLotQty13 },
        { lot: log.upperLot21, qty: log.upperLotQty21 },
        { lot: log.upperLot22, qty: log.upperLotQty22 },
        { lot: log.upperLot23, qty: log.upperLotQty23 },
        { lot: log.upperLot31, qty: log.upperLotQty31 },
        { lot: log.upperLot32, qty: log.upperLotQty32 },
        { lot: log.upperLot33, qty: log.upperLotQty33 },
        { lot: log.lowerLot11, qty: log.lowerLotQty11 },
        { lot: log.lowerLot12, qty: log.lowerLotQty12 },
        { lot: log.lowerLot13, qty: log.lowerLotQty13 },
        { lot: log.lowerLot21, qty: log.lowerLotQty21 },
        { lot: log.lowerLot22, qty: log.lowerLotQty22 },
        { lot: log.lowerLot23, qty: log.lowerLotQty23 },
        { lot: log.lowerLot31, qty: log.lowerLotQty31 },
        { lot: log.lowerLot32, qty: log.lowerLotQty32 },
        { lot: log.lowerLot33, qty: log.lowerLotQty33 },
      ];

      for (const field of allFields) {
        if (!this.isValidLot(field.lot)) continue;
        const qty = Number(field.qty) || 0;
        if (qty === 0) continue;
        const isCathode = field.lot[4] === 'C';

        if (isCathode) cumulativeCathodeOutput += qty;
        else cumulativeAnodeOutput += qty;

        const meta = lotMeta.get(field.lot) || { totalQty: 0, dayQty: new Map(), isCathode };
        meta.totalQty += qty;
        if (isCurrentMonth) {
          meta.dayQty.set(day, (meta.dayQty.get(day) || 0) + qty);
        }
        lotMeta.set(field.lot, meta);

        if (isCurrentMonth) {
          const current = dailyMap.get(day) || { cathodeOutput: 0, anodeOutput: 0, cathodeNotching: 0, anodeNotching: 0 };
          if (isCathode) current.cathodeOutput += qty;
          else current.anodeOutput += qty;
          dailyMap.set(day, current);
        }
      }
    }

    // 2패스: lot별 notching qty를 날짜별 VD output 비율로 배분
    for (const [lot, meta] of lotMeta) {
      const notchingQty = notchingLotMap.get(lot) || 0;
      if (notchingQty === 0 || meta.dayQty.size === 0) continue;

      const currentMonthQty = Array.from(meta.dayQty.values()).reduce((s, v) => s + v, 0);
      if (currentMonthQty === 0) continue;

      const isComplete = meta.totalQty >= notchingQty;
      const days = Array.from(meta.dayQty.entries()).sort((a, b) => a[0] - b[0]);
      const lastDay = days[days.length - 1][0];

      if (isComplete) {
        // VD 완료 lot: notching qty를 날짜별 output 비율로 배분
        const allocatable = Math.min(notchingQty, currentMonthQty);
        let allocated = 0;

        for (let i = 0; i < days.length; i++) {
          const [day, dayQty] = days[i];
          const dayData = dailyMap.get(day) || { cathodeOutput: 0, anodeOutput: 0, cathodeNotching: 0, anodeNotching: 0 };

          const portion = i === days.length - 1
            ? allocatable - allocated
            : Math.round(allocatable * (dayQty / currentMonthQty));

          if (meta.isCathode) dayData.cathodeNotching += portion;
          else dayData.anodeNotching += portion;

          dailyMap.set(day, dayData);
          allocated += portion;
        }
      } else {
        // VD 미완료 lot: notching qty 전체를 마지막 날에 반영 → ng로 잡힘
        const dayData = dailyMap.get(lastDay) || { cathodeOutput: 0, anodeOutput: 0, cathodeNotching: 0, anodeNotching: 0 };
        if (meta.isCathode) dayData.cathodeNotching += notchingQty;
        else dayData.anodeNotching += notchingQty;
        dailyMap.set(lastDay, dayData);
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
    productionTarget: ProjectTarget | null,
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
      const anodeYield =
        dayData.anodeNotching > 0 ? Math.round((dayData.anodeOutput / dayData.anodeNotching) * 100 * 100) / 100 : null;

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
