import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { WorklogPress } from 'src/common/entities/worklog/worklog-04-press.entity';
import { ProjectPlan } from 'src/common/entities/project/project-plan.entity';
import { ProjectTarget } from 'src/common/entities/project/project-target.entity';

@Injectable()
export class PressProcessService {
  constructor(
    @InjectRepository(WorklogPress)
    private readonly pressRepository: Repository<WorklogPress>,
    @InjectRepository(ProjectPlan)
    private readonly projectPlanRepository: Repository<ProjectPlan>,
    @InjectRepository(ProjectTarget)
    private readonly projectTargetRepository: Repository<ProjectTarget>,
  ) {}

  async getMonthlyData(projectId: number, month: string, type: 'cathode' | 'anode') {
    const [productionPlan, productionTarget] = await Promise.all([
      this.projectPlanRepository.findOne({
        where: { project: { id: projectId } },
      }),
      this.projectTargetRepository.findOne({
        where: { project: { id: projectId } },
      }),
    ]);

    if (!productionPlan) throw new NotFoundException('생산 계획이 존재하지 않습니다.');

    const { startDate, endDate } = this.getMonthRange(month);
    const projectStartDate = new Date(productionPlan.startDate);
    const targetChar = type === 'cathode' ? 'C' : 'A';

    const pressLogs = await this.pressRepository.find({
      where: {
        project: { id: projectId },
        manufactureDate: Between(projectStartDate, endDate),
      },
      order: { manufactureDate: 'ASC' },
    });

    return this.processPressData(pressLogs, targetChar, month, productionTarget, type, startDate, endDate);
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
    productionTarget: ProjectTarget | null,
    type: 'cathode' | 'anode',
    monthStartDate: Date,
    monthEndDate: Date,
  ) {
    const dailyMap = new Map<number, { output: number; inputQty: number }>();
    // doubleLot -> { maxCoatingQty, lastDay, lastLogId, lastFieldIndex }
    const doubleLotMeta = new Map<string, { maxCoatingQty: number; lastDay: number | null; lastLogId: number; lastFieldIndex: number }>();
    let cumulativeOutput = 0;

    // 1패스: doubleLot별 최대 coatingQty(최초 롤 m수), 첫 날, 마지막 출현 위치 수집
    for (const log of logs) {
      const logDate = new Date(log.manufactureDate);
      const isCurrentMonth = logDate >= monthStartDate && logDate <= monthEndDate;
      const day = logDate.getDate();

      const pressFields = [
        { pressLot: log.pressLot1, coatingQty: log.coatingQuantity1 },
        { pressLot: log.pressLot2, coatingQty: log.coatingQuantity2 },
        { pressLot: log.pressLot3, coatingQty: log.coatingQuantity3 },
        { pressLot: log.pressLot4, coatingQty: log.coatingQuantity4 },
        { pressLot: log.pressLot5, coatingQty: log.coatingQuantity5 },
      ];

      pressFields.forEach((field, index) => {
        if (field.pressLot && field.pressLot.length >= 5 && field.pressLot[4] === targetChar) {
          const doubleLot = this.extractDoubleLotFromPress(field.pressLot);
          if (doubleLot) {
            const coatingQty = Number(field.coatingQty) || 0;
            const existing = doubleLotMeta.get(doubleLot);
            doubleLotMeta.set(doubleLot, {
              maxCoatingQty: Math.max(coatingQty, existing?.maxCoatingQty || 0),
              lastDay: isCurrentMonth ? day : (existing?.lastDay ?? null),
              lastLogId: log.id,
              lastFieldIndex: index,
            });
          }
        }
      });
    }

    // 2패스: 날짜별 output 집계 + doubleLot 마지막 출현 시점에 inputQty 반영
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

      pressFields.forEach((field, index) => {
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
            const meta = doubleLotMeta.get(doubleLot);
            if (meta && log.id === meta.lastLogId && index === meta.lastFieldIndex) {
              // 마지막 출현 — lastDay에 inputQty 반영
              const targetDay = meta.lastDay ?? (isCurrentMonth ? day : null);
              if (targetDay !== null) {
                const dayData = dailyMap.get(targetDay) || { output: 0, inputQty: 0 };
                dayData.inputQty += meta.maxCoatingQty;
                dailyMap.set(targetDay, dayData);
              }
            }
          }
        }
      });
    }

    // 누적 NG: doubleLot별 코팅 투입량(m) 합계 - 누적 생산량, 월 제한 없이 계산
    let cumulativeInputQty = 0;
    for (const meta of doubleLotMeta.values()) {
      cumulativeInputQty += meta.maxCoatingQty;
    }
    const cumulativeNg = cumulativeInputQty > cumulativeOutput ? cumulativeInputQty - cumulativeOutput : 0;

    return this.buildResult(dailyMap, month, productionTarget, type, cumulativeOutput, cumulativeNg);
  }

  private buildResult(
    dailyMap: Map<number, { output: number; inputQty: number }>,
    month: string,
    productionTarget: ProjectTarget | null,
    type: 'cathode' | 'anode',
    cumulativeOutput: number,
    cumulativeNg = 0,
  ) {
    const daysInMonth = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0).getDate();
    const data: Array<{ day: number; output: number; ng: number | null; yield: number | null }> = [];
    let totalOutput = 0;
    let totalInputQty = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = dailyMap.get(day) || { output: 0, inputQty: 0 };
      const dayNg = dayData.inputQty > 0 && dayData.inputQty > dayData.output ? dayData.inputQty - dayData.output : null;
      const dayYield = dayData.inputQty > 0 ? Math.round((dayData.output / dayData.inputQty) * 100 * 100) / 100 : null;
      data.push({ day, output: dayData.output, ng: dayNg, yield: dayYield });
      totalOutput += dayData.output;
      totalInputQty += dayData.inputQty;
    }

    const targetField = type === 'cathode' ? 'pressCathode' : 'pressAnode';
    const targetQuantity = productionTarget?.[targetField] || null;
    const progress = targetQuantity ? Math.round((cumulativeOutput / targetQuantity) * 100 * 100) / 100 : null;
    const totalNg = totalInputQty > 0 && totalInputQty > totalOutput ? totalInputQty - totalOutput : null;
    const totalYield = totalInputQty > 0 ? Math.round((totalOutput / totalInputQty) * 100 * 100) / 100 : null;

    return {
      data,
      total: { totalOutput, cumulativeOutput, cumulativeNg, targetQuantity, progress, totalNg, totalYield },
    };
  }

  private getMonthRange(month: string): { startDate: Date; endDate: Date } {
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);
    return { startDate, endDate };
  }
}
