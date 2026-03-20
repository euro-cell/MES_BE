import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from '../entities/menu.entity';

@Injectable()
export class MenuSeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepo: Repository<Menu>,
  ) {}

  async onApplicationBootstrap() {
    const count = await this.menuRepo.count();
    if (count > 0) return;
    await this.seed();
  }

  private async seed() {
    // 1depth: 상위 메뉴
    const parents = await this.menuRepo.save([
      { name: '프로젝트 현황 및 등록', path: '/main', displayOrder: 1 },
      { name: '생산 관리', path: '/project', displayOrder: 2 },
      { name: '재고 관리', path: '/stock', displayOrder: 3 },
      { name: '품질 관리', path: '/quality', displayOrder: 4 },
      { name: '설비 관리', path: '/plant', displayOrder: 5 },
      { name: '도면 관리', path: '/draw', displayOrder: 6 },
      { name: '기타', path: '/etc', displayOrder: 7 },
    ]);

    const pid = (name: string) => parents.find((p) => p.name === name)!.id;

    // 2depth: 서브 메뉴
    const children = await this.menuRepo.save([
      // 생산 관리
      { name: '생산계획', path: '/project/plan', parentId: pid('생산 관리'), displayOrder: 1 },
      { name: '설계 및 자재 소요량', path: '/project/spec', parentId: pid('생산 관리'), displayOrder: 2 },
      { name: '작업 일지', path: '/project/log', parentId: pid('생산 관리'), displayOrder: 3 },
      { name: '생산 현황 (수율)', path: '/project/status', parentId: pid('생산 관리'), displayOrder: 4 },
      { name: 'Lot 관리', path: '/project/lot', parentId: pid('생산 관리'), displayOrder: 5 },
      { name: 'Lot 검색', path: '/project/search', parentId: pid('생산 관리'), displayOrder: 6 },
      // 재고 관리
      { name: '원자재 관리', path: '/stock/material', parentId: pid('재고 관리'), displayOrder: 1 },
      { name: '셀 관리', path: '/stock/cell', parentId: pid('재고 관리'), displayOrder: 2 },
      // 품질 관리
      { name: 'IQC', path: '/quality/iqc', parentId: pid('품질 관리'), displayOrder: 1 },
      { name: 'LQC', path: '/quality/lqc', parentId: pid('품질 관리'), displayOrder: 2 },
      { name: 'OQC', path: '/quality/oqc', parentId: pid('품질 관리'), displayOrder: 3 },
      // 설비 관리
      { name: '생산', path: '/plant/production', parentId: pid('설비 관리'), displayOrder: 1 },
      { name: '개발', path: '/plant/development', parentId: pid('설비 관리'), displayOrder: 2 },
      { name: '측정', path: '/plant/measurement', parentId: pid('설비 관리'), displayOrder: 3 },
      // 도면 관리
      { name: '전체', path: '/draw/list', parentId: pid('도면 관리'), displayOrder: 1 },
      { name: '공장', path: '/draw', parentId: pid('도면 관리'), displayOrder: 2 },
      { name: '설비', path: '/draw', parentId: pid('도면 관리'), displayOrder: 3 },
      { name: '제품', path: '/draw', parentId: pid('도면 관리'), displayOrder: 4 },
      { name: 'OEM/ODM', path: '/draw', parentId: pid('도면 관리'), displayOrder: 5 },
      // 기타
      { name: '인원등록', path: '/etc/users', parentId: pid('기타'), displayOrder: 1 },
      { name: '메뉴접근관리', path: '/etc/permission', parentId: pid('기타'), displayOrder: 2 },
      { name: '환경관리', path: '/etc/condition', parentId: pid('기타'), displayOrder: 3 },
      { name: '고객 코드 관리 대장', path: '/etc/customer', parentId: pid('기타'), displayOrder: 4 },
    ]);

    // 3depth: 설비 관리 > 생산 하위
    const plantProduction = children.find((c) => c.name === '생산' && c.parentId === pid('설비 관리'))!;
    const etcCondition = children.find((c) => c.name === '환경관리')!;
    const stockMaterial = children.find((c) => c.name === '원자재 관리')!;
    const stockCell = children.find((c) => c.name === '셀 관리')!;
    await this.menuRepo.save([
      { name: '설비 관리 대장', path: '/plant/production/list', parentId: plantProduction.id, displayOrder: 1 },
      { name: '유지보수 관리 대장', path: '/plant/production/history', parentId: plantProduction.id, displayOrder: 2 },
      { name: '공정 온/습도', path: '/etc/condition/humidity', parentId: etcCondition.id, displayOrder: 1 },
      // 원자재 관리 하위
      { name: '전극', path: '/stock/material/electrode', parentId: stockMaterial.id, displayOrder: 1 },
      { name: '조립', path: '/stock/material/assembly', parentId: stockMaterial.id, displayOrder: 2 },
      // 셀 관리 하위
      { name: '입/출고 등록', path: '/stock/cell/in-out', parentId: stockCell.id, displayOrder: 1 },
      { name: 'RACK 보관 현황', path: '/stock/cell/rack-storage', parentId: stockCell.id, displayOrder: 2 },
      { name: 'NCR 세부 현황', path: '/stock/cell/ncr', parentId: stockCell.id, displayOrder: 3 },
      { name: '프로젝트별 입/출고 현황', path: '/stock/cell/project', parentId: stockCell.id, displayOrder: 4 },
    ]);
  }
}
