import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from 'src/common/entities/project.entity';
import { Repository } from 'typeorm';
import { StatusService } from '../project/status/status.service';
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
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly statusService: StatusService,
  ) {}

  async getSummary(): Promise<DashboardSummaryItem[]> {
    const projects = await this.projectRepository.find({
      order: { id: 'DESC' },
      relations: ['plan'],
    });

    if (projects.length === 0) {
      return [];
    }

    const progressPromises = projects.map((project) =>
      this.statusService.getProgress(project.id).catch(
        (): ProductionProgressDto => ({
          electrode: 0,
          assembly: 0,
          formation: 0,
          overall: 0,
        }),
      ),
    );

    const progressResults = await Promise.all(progressPromises);

    return projects.map((project, index) => {
      const { plan, ...rest } = project;
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
