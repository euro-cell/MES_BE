import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorklogVd } from 'src/common/entities/worklogs/worklog-07-vd.entity';
import { CreateVdWorklogDto, VdWorklogListResponseDto, UpdateVdWorklogDto } from 'src/common/dtos/worklog/07-vd.dto';
import { EquipmentService } from 'src/modules/equipment/equipment.service';

@Injectable()
export class VdService {
  constructor(
    @InjectRepository(WorklogVd)
    private readonly worklogVdRepository: Repository<WorklogVd>,
    private readonly equipmentService: EquipmentService,
  ) {}

  async createVdWorklog(productionId: number, dto: CreateVdWorklogDto): Promise<WorklogVd> {
    const worklog = this.worklogVdRepository.create({
      ...dto,
      production: { id: productionId },
    });
    return await this.worklogVdRepository.save(worklog);
  }

  async getWorklogs(productionId: number): Promise<VdWorklogListResponseDto[]> {
    const worklogs = await this.worklogVdRepository.find({
      where: { production: { id: productionId } },
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
    const worklog = await this.worklogVdRepository.findOne({
      where: { id: +worklogId },
      relations: ['production'],
    });

    if (!worklog) {
      return null;
    }

    // plant ID를 plant name으로 변환
    let plantName: string | null = null;
    if (worklog.plant) {
      plantName = await this.equipmentService.findNameById(worklog.plant);
    }

    const { production, plant, ...rest } = worklog;
    return {
      ...rest,
      productionId: production?.name || '',
      plant: plantName,
    };
  }

  async updateVdWorklog(worklogId: string, updateVdWorklogDto: UpdateVdWorklogDto): Promise<WorklogVd> {
    const worklog = await this.worklogVdRepository.findOne({ where: { id: +worklogId } });

    if (!worklog) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }
    Object.assign(worklog, updateVdWorklogDto);

    return await this.worklogVdRepository.save(worklog);
  }

  async deleteVdWorklog(worklogId: string): Promise<void> {
    const worklog = await this.worklogVdRepository.findOne({ where: { id: +worklogId } });

    if (!worklog) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }
    await this.worklogVdRepository.remove(worklog);
  }
}
