import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { WorklogSlurry } from 'src/common/entities/worklog/worklog-02-slurry.entity';
import { ProjectPlan } from 'src/common/entities/project/project-plan.entity';
import { ProjectTarget } from 'src/common/entities/project/project-target.entity';

@Injectable()
export class MixingProcessService {
  constructor(
    @InjectRepository(WorklogSlurry)
    private readonly slurryRepository: Repository<WorklogSlurry>,
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
    const activeMaterialName = type === 'cathode' ? '양극재' : '음극재';

    const slurryLogs = await this.slurryRepository.find({
      where: {
        project: { id: projectId },
        manufactureDate: Between(projectStartDate, endDate),
      },
      order: { manufactureDate: 'ASC' },
    });

    const dailyMap = new Map<number, number>();
    let cumulativeOutput = 0;

    for (const log of slurryLogs) {
      if (!log.lot || log.lot.length < 5 || log.lot[4].toUpperCase() !== targetChar) continue;

      const logDate = new Date(log.manufactureDate);
      const isCurrentMonth = logDate >= startDate && logDate <= endDate;
      const day = logDate.getDate();

      const materialFields = [
        { name: log.material1Name, input: log.material1ActualInput },
        { name: log.material2Name, input: log.material2ActualInput },
        { name: log.material3Name, input: log.material3ActualInput },
        { name: log.material4Name, input: log.material4ActualInput },
        { name: log.material5Name, input: log.material5ActualInput },
        { name: log.material6Name, input: log.material6ActualInput },
      ];
      const logTotal = materialFields
        .filter((f) => f.name === activeMaterialName)
        .reduce((sum, f) => sum + (Number(f.input) || 0), 0);

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

    const progress = targetQuantity ? Math.round((cumulativeOutput / 1000 / targetQuantity) * 100 * 100) / 100 : null;

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
