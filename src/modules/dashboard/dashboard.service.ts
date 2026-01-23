import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Production } from 'src/common/entities/production.entity';
import { Repository } from 'typeorm';
import { StatusService } from '../production/status/status.service';
import { ProductionProgressDto } from 'src/common/dtos/production-progress.dto';

export interface DashboardSummaryItem {
  id: number;
  name: string;
  company: string;
  mode: string;
  batteryType: string;
  capacity: number;
  targetQuantity: number;
  isPlan: boolean;
  startDate: string | null;
  endDate: string | null;
  progress: ProductionProgressDto;
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Production)
    private readonly productionRepository: Repository<Production>,
    private readonly statusService: StatusService,
  ) {}

  async getSummary(): Promise<DashboardSummaryItem[]> {
    // 1. 모든 프로젝트 목록 조회 (plan 관계 포함)
    const productions = await this.productionRepository.find({
      order: { id: 'DESC' },
      relations: ['plan'],
    });

    if (productions.length === 0) {
      return [];
    }

    // 2. 모든 프로젝트의 progress를 병렬로 조회
    const progressPromises = productions.map((production) =>
      this.statusService.getProgress(production.id).catch(
        (): ProductionProgressDto => ({
          electrode: 0,
          assembly: 0,
          formation: 0,
          overall: 0,
        }),
      ),
    );

    const progressResults = await Promise.all(progressPromises);

    // 3. 데이터 조합하여 반환
    return productions.map((production, index) => {
      const { plan, ...rest } = production;
      return {
        ...rest,
        isPlan: !!plan,
        startDate: plan?.startDate || null,
        endDate: plan?.endDate || null,
        progress: progressResults[index],
      };
    });
  }
}
