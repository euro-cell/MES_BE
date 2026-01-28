import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { WorklogSlurry } from 'src/common/entities/worklogs/worklog-02-slurry.entity';
import { Material } from 'src/common/entities/material.entity';
import { ProductionPlan } from 'src/common/entities/production-plan.entity';
import { ProductionTarget } from 'src/common/entities/production-target.entity';

@Injectable()
export class MixingProcessService {
  constructor(
    @InjectRepository(WorklogSlurry)
    private readonly slurryRepository: Repository<WorklogSlurry>,
    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,
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

    const targetCategory = type === 'cathode' ? '양극재' : '음극재';

    const materials = await this.materialRepository.find({
      where: { category: targetCategory },
    });
    const materialLotNos = new Set(materials.map((m) => m.lotNo));

    const slurryLogs = await this.slurryRepository.find({
      where: {
        production: { id: productionId },
        manufactureDate: Between(projectStartDate, endDate),
      },
      order: { manufactureDate: 'ASC' },
    });

    const dailyMap = new Map<number, number>();
    let cumulativeOutput = 0;

    for (const log of slurryLogs) {
      const logDate = new Date(log.manufactureDate);
      const isCurrentMonth = logDate >= startDate && logDate <= endDate;
      const day = logDate.getDate();

      const materialFields = [
        { lot: log.material1Lot, input: log.material1ActualInput },
        { lot: log.material2Lot, input: log.material2ActualInput },
        { lot: log.material3Lot, input: log.material3ActualInput },
        { lot: log.material4Lot, input: log.material4ActualInput },
        { lot: log.material5Lot, input: log.material5ActualInput },
        { lot: log.material6Lot, input: log.material6ActualInput },
        { lot: log.binderSolutionLot, input: log.binderSolutionActualInput },
      ];

      let logTotal = 0;
      for (const field of materialFields) {
        if (field.lot && materialLotNos.has(field.lot)) {
          logTotal += Number(field.input) || 0;
        }
      }

      cumulativeOutput += logTotal;

      if (isCurrentMonth) {
        const current = dailyMap.get(day) || 0;
        dailyMap.set(day, current + logTotal);
      }
    }

    const daysInMonth = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0).getDate();
    const data: Array<{ day: number; output: number; ng: number | null; yield: number | null }> = [];
    let totalOutput = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const output = dailyMap.get(day) || 0;

      data.push({ day, output, ng: null, yield: null });
      totalOutput += output;
    }

    const targetField = type === 'cathode' ? 'mixingCathode' : 'mixingAnode';
    const targetQuantity = productionTarget?.[targetField] || null;

    const progress = targetQuantity ? Math.round((cumulativeOutput / targetQuantity) * 100 * 100) / 100 : null;

    return {
      data,
      total: {
        totalOutput,
        cumulativeOutput,
        targetQuantity,
        progress,
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
