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
    // Step 1: 모든 프로젝트 조회 + 모든 NCR 항목 조회 + 전체 카운트를 병렬로 한 번에 가져옴
    const [projects, ncrItems, allCounts] = await Promise.all([
      this.getAllProjects(),
      this.cellNcrRepository.find(),
      // ncrGrade × (projectName, projectNo) 조합별 카운트를 단일 GROUP BY 쿼리로 조회
      this.cellInventoryRepository
        .createQueryBuilder('ci')
        .select('ci.ncrGrade', 'ncrGrade')
        .addSelect('ci.projectName', 'projectName')
        .addSelect('ci.projectNo', 'projectNo')
        .addSelect('COUNT(*)', 'count')
        .where('ci.ncrGrade IS NOT NULL')
        .groupBy('ci.ncrGrade')
        .addGroupBy('ci.projectName')
        .addGroupBy('ci.projectNo')
        .getRawMany<{ ncrGrade: string; projectName: string; projectNo: string | null; count: string }>(),
    ]);

    // Step 2: 카운트 결과를 Map으로 인덱싱 (ncrGrade|projectNo|projectName → count)
    const countMap = new Map<string, number>();
    for (const row of allCounts) {
      const key = `${row.ncrGrade}|${row.projectNo || 'null'}|${row.projectName}`;
      countMap.set(key, parseInt(row.count, 10));
    }

    // Step 3: 카테고리 순서 정의 및 NCR 항목 정렬
    const categoryOrder = { Formation: 0, Inspection: 1, Other: 2 };
    const sortedNcrItems = ncrItems.sort((a, b) => {
      const catA = categoryOrder[a.category] ?? 3;
      const catB = categoryOrder[b.category] ?? 3;
      if (catA !== catB) return catA - catB;
      return a.id - b.id;
    });

    // Step 4: 메모리 내에서 프로젝트별 카운트 매핑
    const data: NcrStatisticsDto[] = sortedNcrItems.map((ncrItem) => ({
      id: ncrItem.id,
      category: ncrItem.category,
      ncrType: ncrItem.ncrType,
      title: ncrItem.title,
      code: ncrItem.code,
      counts: projects.map((project) => ({
        projectNo: project.projectNo,
        projectName: project.projectName,
        count: countMap.get(`${ncrItem.code}|${project.projectNo || 'null'}|${project.projectName}`) ?? 0,
      })),
    }));

    return { data, projects };
  }

  async getDetail(projectName: string, projectNo?: string): Promise<NcrDetailResponseDto> {
    // Step 1: 해당 프로젝트의 NCR 코드 목록 조회
    const query = this.cellInventoryRepository
      .createQueryBuilder('ci')
      .select('DISTINCT ci.ncrGrade', 'ncrGrade')
      .where('ci.projectName = :projectName', { projectName })
      .andWhere('ci.ncrGrade IS NOT NULL');

    if (projectNo) {
      query.andWhere('ci.projectNo = :projectNo', { projectNo });
    } else {
      query.andWhere('ci.projectNo IS NULL');
    }

    const ncrGrades = await query.getRawMany<{ ncrGrade: string }>();
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

  async getAllDetails(projects: Array<{ projectName: string; projectNo: string | null }>): Promise<Map<string, NcrDetailResponseDto>> {
    if (projects.length === 0) return new Map();

    const projectNames = [...new Set(projects.map((p) => p.projectName))];

    // 한 번에 모든 ncrGrade 조회
    const ncrGradesRaw = await this.cellInventoryRepository
      .createQueryBuilder('ci')
      .select('ci.projectName', 'projectName')
      .addSelect('ci.projectNo', 'projectNo')
      .addSelect('ci.ncrGrade', 'ncrGrade')
      .where('ci.projectName IN (:...projectNames)', { projectNames })
      .andWhere('ci.ncrGrade IS NOT NULL')
      .distinct(true)
      .getRawMany<{ projectName: string; projectNo: string | null; ncrGrade: string }>();

    // 한 번에 모든 CellNcr 조회
    const allNcrCodes = [...new Set(ncrGradesRaw.map((r) => r.ncrGrade))];
    const allNcrItems = allNcrCodes.length > 0
      ? await this.cellNcrRepository.find({ where: allNcrCodes.map((code) => ({ code })) })
      : [];
    const ncrItemByCode = new Map(allNcrItems.map((item) => [item.code, item]));

    // 한 번에 모든 CellNcrDetail 조회
    const allDetails = projectNames.length > 0
      ? await this.cellNcrDetailRepository
          .createQueryBuilder('d')
          .leftJoinAndSelect('d.cellNcr', 'ncr')
          .where('d.projectName IN (:...projectNames)', { projectNames })
          .orderBy('d.id', 'ASC')
          .getMany()
      : [];

    // projectName+ncrId 키로 detail 그룹핑
    const detailsByKey = new Map<string, typeof allDetails>();
    for (const detail of allDetails) {
      const key = `${detail.projectName}::${detail.cellNcr.id}`;
      if (!detailsByKey.has(key)) detailsByKey.set(key, []);
      detailsByKey.get(key)!.push(detail);
    }

    const categoryOrder: Record<string, number> = { Formation: 0, Inspection: 1, Other: 2 };

    const result = new Map<string, NcrDetailResponseDto>();
    for (const project of projects) {
      const key = `${project.projectName}::${project.projectNo ?? ''}`;
      const projectNcrCodes = ncrGradesRaw
        .filter((r) => r.projectName === project.projectName && (r.projectNo ?? '') === (project.projectNo ?? ''))
        .map((r) => r.ncrGrade);

      const ncrItems = projectNcrCodes
        .map((code) => ncrItemByCode.get(code))
        .filter((item): item is NonNullable<typeof item> => item != null)
        .sort((a, b) => {
          const catA = categoryOrder[a.category] ?? 3;
          const catB = categoryOrder[b.category] ?? 3;
          if (catA !== catB) return catA - catB;
          return a.id - b.id;
        });

      const ncrDetails: NcrDetailDto[] = ncrItems.map((ncrItem) => {
        const details = detailsByKey.get(`${project.projectName}::${ncrItem.id}`) ?? [];
        return {
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
        };
      });

      result.set(key, { projectName: project.projectName, ncrDetails });
    }

    return result;
  }

  async updateDetail(dto: UpdateNcrDetailRequestDto, projectNo?: string): Promise<{ message: string }> {
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

}
