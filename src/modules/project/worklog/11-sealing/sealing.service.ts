import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorklogSealing } from 'src/common/entities/worklog/worklog-11-sealing.entity';
import { CreateSealingWorklogDto, SealingWorklogListResponseDto, UpdateSealingWorklogDto } from 'src/common/dtos/worklog/11-sealing.dto';
import { EquipmentService } from 'src/modules/equipment/equipment.service';

@Injectable()
export class SealingService {
  constructor(
    @InjectRepository(WorklogSealing)
    private readonly worklogSealingRepository: Repository<WorklogSealing>,
    private readonly equipmentService: EquipmentService,
  ) {}

  async createSealingWorklog(projectId: number, dto: CreateSealingWorklogDto): Promise<WorklogSealing> {
    const worklog = this.worklogSealingRepository.create({
      ...dto,
      project: { id: projectId },
    });
    return await this.worklogSealingRepository.save(worklog);
  }

  async getWorklogs(projectId: number): Promise<SealingWorklogListResponseDto[]> {
    const worklogs = await this.worklogSealingRepository.find({
      where: { project: { id: projectId } },
      order: { manufactureDate: 'ASC', createdAt: 'ASC' },
    });
    const dateRoundMap = new Map<string, number>();

    const worklogsWithRound = worklogs.map((worklog) => {
      const dateKey = worklog.manufactureDate.toString();
      const currentRound = dateRoundMap.get(dateKey) || 0;
      const round = currentRound + 1;
      dateRoundMap.set(dateKey, round);

      return {
        id: worklog.id,
        workDate: worklog.manufactureDate.toString(),
        round: round,
        writer: worklog.writer || '',
      };
    });
    return worklogsWithRound.reverse();
  }

  async findWorklogById(worklogId: string) {
    const worklog = await this.worklogSealingRepository.findOne({
      where: { id: +worklogId },
      relations: ['project'],
    });

    if (!worklog) {
      return null;
    }

    // plant ID를 plant name으로 변환
    let plantName: string | null = null;
    if (worklog.plant) {
      plantName = await this.equipmentService.findNameById(worklog.plant);
    }

    const { project, plant, ...rest } = worklog;
    return {
      ...rest,
      projectId: project?.name || '',
      plant: plantName,
    };
  }

  async updateSealingWorklog(worklogId: string, updateSealingWorklogDto: UpdateSealingWorklogDto): Promise<WorklogSealing> {
    const worklog = await this.worklogSealingRepository.findOne({ where: { id: +worklogId } });

    if (!worklog) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }
    Object.assign(worklog, updateSealingWorklogDto);

    return await this.worklogSealingRepository.save(worklog);
  }

  async deleteSealingWorklog(worklogId: string): Promise<void> {
    const worklog = await this.worklogSealingRepository.findOne({ where: { id: +worklogId } });

    if (!worklog) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }
    await this.worklogSealingRepository.remove(worklog);
  }
}
