import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorklogForming } from 'src/common/entities/worklogs/worklog-08-forming.entity';
import { CreateFormingWorklogDto, FormingWorklogListResponseDto, UpdateFormingWorklogDto } from 'src/common/dtos/worklog/08-forming.dto';
import { MaterialService } from 'src/modules/material/material.service';
import { MaterialProcess } from 'src/common/enums/material.enum';

@Injectable()
export class FormingService {
  constructor(
    @InjectRepository(WorklogForming)
    private readonly worklogFormingRepository: Repository<WorklogForming>,
    private readonly materialService: MaterialService,
  ) {}

  async createFormingWorklog(productionId: number, dto: CreateFormingWorklogDto): Promise<WorklogForming> {
    const worklog = this.worklogFormingRepository.create({
      ...dto,
      production: { id: productionId },
    });
    const savedWorklog = await this.worklogFormingRepository.save(worklog);

    // 자재 사용 이력 기록 (pouch)
    if (dto.pouchLot && dto.pouchUsage && dto.pouchUsage > 0) {
      await this.materialService.recordMaterialUsage(dto.pouchLot, undefined, dto.pouchUsage, MaterialProcess.ELECTRODE);
    }

    return savedWorklog;
  }

  async getWorklogs(productionId: number): Promise<FormingWorklogListResponseDto[]> {
    const worklogs = await this.worklogFormingRepository.find({
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

  async findWorklogById(worklogId: string): Promise<WorklogForming | null> {
    return await this.worklogFormingRepository.findOne({
      where: { id: +worklogId },
    });
  }

  async updateFormingWorklog(worklogId: string, updateFormingWorklogDto: UpdateFormingWorklogDto): Promise<WorklogForming> {
    const worklog = await this.worklogFormingRepository.findOne({ where: { id: +worklogId } });

    if (!worklog) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }

    // 변경 전 pouchUsage 저장
    const previousPouchUsage = worklog.pouchUsage || 0;

    Object.assign(worklog, updateFormingWorklogDto);
    const savedWorklog = await this.worklogFormingRepository.save(worklog);

    // 자재 사용 이력 수정 - 사용량이 변경된 경우
    const newPouchUsage = updateFormingWorklogDto.pouchUsage || 0;
    if (updateFormingWorklogDto.pouchLot && newPouchUsage !== previousPouchUsage) {
      await this.materialService.updateMaterialUsageHistory(
        updateFormingWorklogDto.pouchLot,
        undefined,
        newPouchUsage,
        MaterialProcess.ELECTRODE,
      );
    }

    return savedWorklog;
  }

  async deleteFormingWorklog(worklogId: string): Promise<void> {
    const worklog = await this.worklogFormingRepository.findOne({ where: { id: +worklogId } });

    if (!worklog) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }
    await this.worklogFormingRepository.remove(worklog);
  }
}
