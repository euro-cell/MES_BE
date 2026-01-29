import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorklogNotching } from 'src/common/entities/worklogs/worklog-06-notching.entity';
import { CreateNotchingWorklogDto, NotchingWorklogListResponseDto, UpdateNotchingWorklogDto } from 'src/common/dtos/worklog/06-notching.dto';
import { EquipmentService } from 'src/modules/equipment/equipment.service';

@Injectable()
export class NotchingService {
  constructor(
    @InjectRepository(WorklogNotching)
    private readonly worklogNotchingRepository: Repository<WorklogNotching>,
    private readonly equipmentService: EquipmentService,
  ) {}

  async createNotchingWorklog(productionId: number, dto: CreateNotchingWorklogDto): Promise<WorklogNotching> {
    const worklog = this.worklogNotchingRepository.create({
      ...dto,
      production: { id: productionId },
    });
    return await this.worklogNotchingRepository.save(worklog);
  }

  async getWorklogs(productionId: number): Promise<NotchingWorklogListResponseDto[]> {
    const worklogs = await this.worklogNotchingRepository.find({
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
    const worklog = await this.worklogNotchingRepository.findOne({
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

  async updateNotchingWorklog(worklogId: string, updateNotchingWorklogDto: UpdateNotchingWorklogDto): Promise<WorklogNotching> {
    const worklog = await this.worklogNotchingRepository.findOne({ where: { id: +worklogId } });

    if (!worklog) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }
    Object.assign(worklog, updateNotchingWorklogDto);

    return await this.worklogNotchingRepository.save(worklog);
  }

  async deleteNotchingWorklog(worklogId: string): Promise<void> {
    const worklog = await this.worklogNotchingRepository.findOne({ where: { id: +worklogId } });

    if (!worklog) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }
    await this.worklogNotchingRepository.remove(worklog);
  }

  async getLots(productionId: number): Promise<{ cathodeLots: string[]; anodeLots: string[] }> {
    const worklogs = await this.worklogNotchingRepository.find({
      where: { production: { id: productionId } },
      select: ['notchingLot1', 'notchingLot2', 'notchingLot3', 'notchingLot4', 'notchingLot5'],
    });

    const cathodeLots = new Set<string>();
    const anodeLots = new Set<string>();

    for (const worklog of worklogs) {
      const lots = [worklog.notchingLot1, worklog.notchingLot2, worklog.notchingLot3, worklog.notchingLot4, worklog.notchingLot5];

      for (const lot of lots) {
        if (lot && lot.length >= 5) {
          const fifthChar = lot.charAt(4);
          if (fifthChar === 'C') {
            cathodeLots.add(lot);
          } else if (fifthChar === 'A') {
            anodeLots.add(lot);
          }
        }
      }
    }

    return {
      cathodeLots: Array.from(cathodeLots),
      anodeLots: Array.from(anodeLots),
    };
  }
}
