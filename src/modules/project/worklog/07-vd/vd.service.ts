import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorklogVd } from 'src/common/entities/worklog/worklog-07-vd.entity';
import { CreateVdWorklogDto, VdWorklogListResponseDto, UpdateVdWorklogDto } from 'src/common/dtos/worklog/07-vd.dto';
import { EquipmentService } from 'src/modules/equipment/equipment.service';

function getVdElectrodeType(worklog: WorklogVd): '양극' | '음극' | '양극/음극' | null {
  const lots = [
    worklog.upperLot11,
    worklog.upperLot12,
    worklog.upperLot13,
    worklog.upperLot21,
    worklog.upperLot22,
    worklog.upperLot23,
    worklog.upperLot31,
    worklog.upperLot32,
    worklog.upperLot33,
    worklog.lowerLot11,
    worklog.lowerLot12,
    worklog.lowerLot13,
    worklog.lowerLot21,
    worklog.lowerLot22,
    worklog.lowerLot23,
    worklog.lowerLot31,
    worklog.lowerLot32,
    worklog.lowerLot33,
  ];
  let hasCathode = false;
  let hasAnode = false;
  for (const lot of lots) {
    if (!lot || lot.length < 5) continue;
    const ch = lot[4].toUpperCase();
    if (ch === 'C') hasCathode = true;
    if (ch === 'A') hasAnode = true;
  }
  if (hasCathode && hasAnode) return '양극/음극';
  if (hasCathode) return '양극';
  if (hasAnode) return '음극';
  return null;
}

@Injectable()
export class VdService {
  constructor(
    @InjectRepository(WorklogVd)
    private readonly worklogVdRepository: Repository<WorklogVd>,
    private readonly equipmentService: EquipmentService,
  ) {}

  async createVdWorklog(projectId: number, dto: CreateVdWorklogDto): Promise<WorklogVd> {
    const worklog = this.worklogVdRepository.create({
      ...dto,
      project: { id: projectId },
    });
    return await this.worklogVdRepository.save(worklog);
  }

  async getWorklogs(projectId: number): Promise<VdWorklogListResponseDto[]> {
    const worklogs = await this.worklogVdRepository.find({
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
        electrodeType: getVdElectrodeType(worklog),
      };
    });
    return worklogsWithRound.reverse();
  }

  async findWorklogById(worklogId: string) {
    const worklog = await this.worklogVdRepository.findOne({
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
