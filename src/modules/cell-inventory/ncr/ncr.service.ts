import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CellNcr } from 'src/common/entities/cell-ncr.entity';
import { CellNcrDetail } from 'src/common/entities/cell-ncr-detail.entity';
import { CellInventory } from 'src/common/entities/cell-inventory.entity';
import {
  NcrStatisticsResponseDto,
  NcrStatisticsDto,
  ProjectDto,
  ProjectCountDto,
  NcrDetailResponseDto,
  NcrDetailDto,
  UpdateNcrDetailRequestDto,
} from 'src/common/dtos/ncr-statistics.dto';

@Injectable()
export class NcrService {
  constructor(
    @InjectRepository(CellNcr)
    private readonly cellNcrRepository: Repository<CellNcr>,
    @InjectRepository(CellNcrDetail)
    private readonly cellNcrDetailRepository: Repository<CellNcrDetail>,
    @InjectRepository(CellInventory)
    private readonly cellInventoryRepository: Repository<CellInventory>,
  ) {}

  async getStatistics(): Promise<NcrStatisticsResponseDto> {
    // Step 1: 모든 프로젝트 조회 (구형 프로젝트 먼저)
    const projects = await this.getAllProjects();

    // Step 2: 카테고리 순서 정의 (Formation, Inspection, 기타)
    const categoryOrder = { Formation: 0, Inspection: 1, Other: 2 };

    // Step 3: 모든 NCR 항목 조회 및 정렬
    const ncrItems = await this.cellNcrRepository.find();
    const sortedNcrItems = ncrItems.sort((a, b) => {
      const catA = categoryOrder[a.category] ?? 3;
      const catB = categoryOrder[b.category] ?? 3;
      if (catA !== catB) return catA - catB;
      return a.id - b.id;
    });

    // Step 4: 각 NCR 항목에 대해 프로젝트별 카운트 계산
    const data: NcrStatisticsDto[] = [];
    for (const ncrItem of sortedNcrItems) {
      const counts = await this.getCountsForNcr(ncrItem.code, projects);
      data.push({
        id: ncrItem.id,
        category: ncrItem.category,
        ncrType: ncrItem.ncrType,
        title: ncrItem.title,
        code: ncrItem.code,
        counts,
      });
    }

    return {
      data,
      projects,
    };
  }

  async getDetail(projectName: string): Promise<NcrDetailResponseDto> {
    // Step 1: 해당 프로젝트의 NCR 코드 목록 조회
    const ncrGrades = await this.cellInventoryRepository
      .createQueryBuilder('ci')
      .select('DISTINCT ci.ncrGrade', 'ncrGrade')
      .where('ci.projectName = :projectName', { projectName })
      .andWhere('ci.ncrGrade IS NOT NULL')
      .getRawMany<{ ncrGrade: string }>();

    const projectNcrCodes = ncrGrades.map((n) => n.ncrGrade);

    // Step 2: 해당 NCR 코드들에 대한 CellNcr 정보 조회
    const categoryOrder = { Formation: 0, Inspection: 1, Other: 2 };
    const ncrItems = await this.cellNcrRepository.find({
      where: projectNcrCodes.map((code) => ({ code })),
    });

    const sortedNcrItems = ncrItems.sort((a, b) => {
      const catA = categoryOrder[a.category] ?? 3;
      const catB = categoryOrder[b.category] ?? 3;
      if (catA !== catB) return catA - catB;
      return a.id - b.id;
    });

    // Step 3: 각 NCR 코드에 대해 CellNcrDetail 조회
    const ncrDetails: NcrDetailDto[] = [];
    for (const ncrItem of sortedNcrItems) {
      const details = await this.cellNcrDetailRepository.find({
        where: { projectName, cellNcr: { id: ncrItem.id } },
        order: { id: 'ASC' },
      });

      ncrDetails.push({
        id: ncrItem.id,
        code: ncrItem.code,
        title: ncrItem.title,
        category: ncrItem.category,
        ncrType: ncrItem.ncrType,
        items: details.map((d) => ({
          id: d.id,
          title: d.title,
          details: d.details,
          type: d.type,
          count: d.count,
        })),
      });
    }

    return {
      projectName,
      ncrDetails,
    };
  }

  async updateDetail(dto: UpdateNcrDetailRequestDto): Promise<{ message: string }> {
    const { projectName, ncrDetails } = dto;

    for (const ncrDetail of ncrDetails) {
      const cellNcr = await this.cellNcrRepository.findOne({
        where: { id: ncrDetail.id },
      });

      if (!cellNcr) continue;

      for (const item of ncrDetail.items) {
        if (!item.id || item.id === 0) {
          // 신규 생성
          const newDetail = this.cellNcrDetailRepository.create({
            projectName,
            title: item.title,
            details: item.details,
            type: item.type,
            count: item.count,
            cellNcr,
          });
          await this.cellNcrDetailRepository.save(newDetail);
        } else {
          // 기존 항목 업데이트
          await this.cellNcrDetailRepository.update(item.id, {
            title: item.title,
            details: item.details,
            type: item.type,
            count: item.count,
          });
        }
      }
    }

    return { message: '저장되었습니다.' };
  }

  private async getAllProjects(): Promise<ProjectDto[]> {
    const projects = await this.cellInventoryRepository
      .createQueryBuilder('ci')
      .select('ci.projectNo', 'projectNo')
      .addSelect('ci.projectName', 'projectName')
      .distinct(true)
      .where('ci.ncrGrade IS NOT NULL')
      .getRawMany();

    const uniqueProjects = Array.from(
      new Map(
        projects.map((p) => [`${p.projectNo || 'null'}|${p.projectName}`, { projectNo: p.projectNo || null, projectName: p.projectName }]),
      ).values(),
    );

    // 구형 프로젝트(projectNo 있는 것) 먼저, 그 다음 신형 프로젝트
    return uniqueProjects.sort((a, b) => {
      if (a.projectNo && !b.projectNo) return -1;
      if (!a.projectNo && b.projectNo) return 1;
      if (a.projectNo !== b.projectNo) {
        return (a.projectNo || '').localeCompare(b.projectNo || '');
      }
      return a.projectName.localeCompare(b.projectName);
    });
  }

  private async getCountsForNcr(ncrCode: string, projects: ProjectDto[]): Promise<ProjectCountDto[]> {
    const countMap = new Map<string, number>();

    // 각 프로젝트별로 카운트 조회
    for (const project of projects) {
      const query = this.cellInventoryRepository
        .createQueryBuilder('ci')
        .where('ci.ncrGrade = :ncrCode', { ncrCode })
        .andWhere('ci.projectName = :projectName', { projectName: project.projectName });

      if (project.projectNo) {
        query.andWhere('ci.projectNo = :projectNo', { projectNo: project.projectNo });
      } else {
        query.andWhere('ci.projectNo IS NULL');
      }

      const count = await query.getCount();
      const key = `${project.projectNo || 'null'}|${project.projectName}`;
      countMap.set(key, count);
    }

    // 프로젝트 순서에 맞춰 count 배열 구성
    return projects.map((project) => ({
      projectNo: project.projectNo,
      projectName: project.projectName,
      count: countMap.get(`${project.projectNo || 'null'}|${project.projectName}`) || 0,
    }));
  }
}
