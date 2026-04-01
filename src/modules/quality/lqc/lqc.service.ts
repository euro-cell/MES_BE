import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LqcSpec } from 'src/common/entities/specification/lqc-spec.entity';
import { LqcProcessType, LqcItemType } from 'src/common/enums/lqc.enum';
import { CreateLqcSpecDto } from 'src/common/dtos/lqc-spec.dto';
import { WorklogBinder } from 'src/common/entities/worklog/worklog-01-binder.entity';
import { WorklogSlurry } from 'src/common/entities/worklog/worklog-02-slurry.entity';
import { WorklogCoating } from 'src/common/entities/worklog/worklog-03-coating.entity';
import { WorklogPress } from 'src/common/entities/worklog/worklog-04-press.entity';
import { WorklogVd } from 'src/common/entities/worklog/worklog-07-vd.entity';
import { WorklogSealing } from 'src/common/entities/worklog/worklog-11-sealing.entity';
import { WorklogFormation } from 'src/common/entities/worklog/worklog-13-formation.entity';
import { LotFormation } from 'src/common/entities/lot/lot-08-formation.entity';

@Injectable()
export class LqcService {
  constructor(
    @InjectRepository(LqcSpec)
    private readonly lqcSpecRepository: Repository<LqcSpec>,
    @InjectRepository(WorklogBinder)
    private readonly worklogBinderRepository: Repository<WorklogBinder>,
    @InjectRepository(WorklogSlurry)
    private readonly worklogSlurryRepository: Repository<WorklogSlurry>,
    @InjectRepository(WorklogCoating)
    private readonly worklogCoatingRepository: Repository<WorklogCoating>,
    @InjectRepository(WorklogPress)
    private readonly worklogPressRepository: Repository<WorklogPress>,
    @InjectRepository(WorklogVd)
    private readonly worklogVdRepository: Repository<WorklogVd>,
    @InjectRepository(WorklogSealing)
    private readonly worklogSealingRepository: Repository<WorklogSealing>,
    @InjectRepository(WorklogFormation)
    private readonly worklogFormationRepository: Repository<WorklogFormation>,
    @InjectRepository(LotFormation)
    private readonly lotFormationRepository: Repository<LotFormation>,
  ) {}

  async getSpec(projectId: number, processType?: LqcProcessType, itemType?: LqcItemType): Promise<LqcSpec[]> {
    const query = this.lqcSpecRepository.createQueryBuilder('spec').where('spec.project_id = :projectId', { projectId });

    if (processType) {
      query.andWhere('spec.processType = :processType', { processType });
    }

    if (itemType) {
      query.andWhere('spec.itemType = :itemType', { itemType });
    }

    return query.getMany();
  }

  async upsertSpec(projectId: number, dto: CreateLqcSpecDto): Promise<LqcSpec> {
    const existing = await this.lqcSpecRepository.findOne({
      where: {
        project: { id: projectId },
        processType: dto.processType,
        itemType: dto.itemType,
      },
    });

    if (existing) {
      existing.specs = dto.specs;
      return this.lqcSpecRepository.save(existing);
    }

    const newSpec = this.lqcSpecRepository.create({
      project: { id: projectId },
      processType: dto.processType,
      itemType: dto.itemType,
      specs: dto.specs,
    });

    return this.lqcSpecRepository.save(newSpec);
  }

  async getBinderWorklogData(projectId: number, electrode?: 'A' | 'C') {
    const query = this.worklogBinderRepository
      .createQueryBuilder('binder')
      .select([
        'binder.id',
        'binder.manufactureDate',
        'binder.lot',
        'binder.solidContent1',
        'binder.solidContent2',
        'binder.solidContent3',
        'binder.viscosity',
      ])
      .where('binder.project_id = :projectId', { projectId });

    if (electrode) {
      // LOT 5번째 인덱스(index 4)로 양극(C)/음극(A) 구분
      query.andWhere('SUBSTRING(binder.lot, 5, 1) = :electrode', { electrode });
    }

    query.orderBy('binder.manufactureDate', 'DESC');

    return query.getMany();
  }

  async getSlurryWorklogData(projectId: number, electrode?: 'A' | 'C') {
    const query = this.worklogSlurryRepository
      .createQueryBuilder('slurry')
      .select([
        'slurry.id',
        'slurry.manufactureDate',
        'slurry.lot',
        'slurry.solidContent1Percentage',
        'slurry.solidContent2Percentage',
        'slurry.solidContent3Percentage',
        'slurry.grindGageFineParticle2',
        'slurry.viscosityAfterStabilization',
      ])
      .where('slurry.project_id = :projectId', { projectId });

    if (electrode) {
      query.andWhere('SUBSTRING(slurry.lot, 5, 1) = :electrode', { electrode });
    }

    query.orderBy('slurry.manufactureDate', 'DESC');

    return query.getMany();
  }

  async getCoatingWorklogData(projectId: number, electrode?: 'A' | 'C') {
    const coatings = await this.worklogCoatingRepository.find({
      where: { project: { id: projectId } },
      order: { manufactureDate: 'DESC' },
    });

    const toNumber = (value: any) => (value != null ? Number(value) : null);

    // 모든 LOT 데이터 수집 (Front/Rear 모두 저장)
    const lotDataMap = new Map<
      string,
      {
        id: number;
        lot: string;
        sNumber: string;
        isDoubleSide: boolean;
        // 전단 (Front)
        frontAreaTop: number | null;
        frontAreaMiddle: number | null;
        frontAreaBottom: number | null;
        // 후단 (Rear)
        rearAreaTop: number | null;
        rearAreaMiddle: number | null;
        rearAreaBottom: number | null;
        // 기타
        coatingWidth: number | null;
        uncoatedArea: number | null;
        mismatch: number | null;
        thicknessTop: number | null;
        thicknessMiddle: number | null;
        thicknessBottom: number | null;
      }
    >();

    for (const coating of coatings) {
      for (let i = 1; i <= 4; i++) {
        const lot = coating[`coatingLot${i}`] as string;
        if (!lot) continue;

        // electrode 필터링 (LOT 5번째 문자)
        if (electrode && lot.charAt(4) !== electrode) continue;

        // S번호 추출 (예: S1, S1B1 -> S1)
        const sMatch = lot.match(/S(\d+)(B\d+)?$/);
        if (!sMatch) continue;

        const sNumber = `S${sMatch[1]}`;
        const isDoubleSide = !!sMatch[2]; // B가 붙으면 양면

        lotDataMap.set(lot, {
          id: coating.id,
          lot,
          sNumber,
          isDoubleSide,
          // 전단 (Front)
          frontAreaTop: toNumber(coating[`weightPerAreaFront${i}M`]),
          frontAreaMiddle: toNumber(coating[`weightPerAreaFront${i}C`]),
          frontAreaBottom: toNumber(coating[`weightPerAreaFront${i}D`]),
          // 후단 (Rear)
          rearAreaTop: toNumber(coating[`weightPerAreaRear${i}M`]),
          rearAreaMiddle: toNumber(coating[`weightPerAreaRear${i}C`]),
          rearAreaBottom: toNumber(coating[`weightPerAreaRear${i}D`]),
          // 기타
          coatingWidth: toNumber(coating[`coatingWidth${i}`]),
          uncoatedArea: toNumber(coating[`uncoatedWidth${i}`]),
          mismatch: toNumber(coating[`misalignment${i}`]),
          thicknessTop: toNumber(coating[`thicknessFront${i}M`]),
          thicknessMiddle: toNumber(coating[`thicknessFront${i}C`]),
          thicknessBottom: toNumber(coating[`thicknessFront${i}D`]),
        });
      }
    }

    // 양면 LOT 기준으로 전단/후단 각각 결과 생성
    const result: any[] = [];
    const processedKeys = new Set<string>();

    for (const [, doubleSideData] of lotDataMap) {
      if (!doubleSideData.isDoubleSide) continue; // 양면만 처리

      const key = doubleSideData.sNumber;
      if (processedKeys.has(key)) continue;
      processedKeys.add(key);

      // 같은 S번호의 단면 찾기
      const singleSideData = Array.from(lotDataMap.values()).find((d) => !d.isDoubleSide && d.sNumber === doubleSideData.sNumber);

      // 전단 행
      result.push({
        id: doubleSideData.id,
        lot: doubleSideData.lot,
        division: '전',
        singleSideTop: singleSideData?.frontAreaTop ?? null,
        singleSideMiddle: singleSideData?.frontAreaMiddle ?? null,
        singleSideBottom: singleSideData?.frontAreaBottom ?? null,
        doubleSideTop: doubleSideData.frontAreaTop,
        doubleSideMiddle: doubleSideData.frontAreaMiddle,
        doubleSideBottom: doubleSideData.frontAreaBottom,
        coatingWidth: doubleSideData.coatingWidth,
        uncoatedArea: doubleSideData.uncoatedArea,
        mismatch: doubleSideData.mismatch,
        thicknessTop: doubleSideData.thicknessTop,
        thicknessMiddle: doubleSideData.thicknessMiddle,
        thicknessBottom: doubleSideData.thicknessBottom,
      });

      // 후단 행
      result.push({
        id: doubleSideData.id,
        lot: doubleSideData.lot,
        division: '후',
        singleSideTop: singleSideData?.rearAreaTop ?? null,
        singleSideMiddle: singleSideData?.rearAreaMiddle ?? null,
        singleSideBottom: singleSideData?.rearAreaBottom ?? null,
        doubleSideTop: doubleSideData.rearAreaTop,
        doubleSideMiddle: doubleSideData.rearAreaMiddle,
        doubleSideBottom: doubleSideData.rearAreaBottom,
        coatingWidth: doubleSideData.coatingWidth,
        uncoatedArea: doubleSideData.uncoatedArea,
        mismatch: doubleSideData.mismatch,
        thicknessTop: doubleSideData.thicknessTop,
        thicknessMiddle: doubleSideData.thicknessMiddle,
        thicknessBottom: doubleSideData.thicknessBottom,
      });
    }

    return result;
  }

  async getPressWorklogData(projectId: number, electrode?: 'A' | 'C') {
    const presses = await this.worklogPressRepository.find({
      where: { project: { id: projectId } },
      order: { manufactureDate: 'DESC' },
    });

    const toNumber = (value: any) => (value != null ? Number(value) : null);

    const result: any[] = [];
    const processedLots = new Set<string>();

    for (const press of presses) {
      for (let i = 1; i <= 5; i++) {
        const lot = press[`pressLot${i}`] as string;
        if (!lot) continue;

        // electrode 필터링 (LOT 5번째 문자)
        if (electrode && lot.charAt(4) !== electrode) continue;

        // 중복 LOT 방지
        if (processedLots.has(lot)) continue;
        processedLots.add(lot);

        // 전단 행
        result.push({
          id: press.id,
          lot,
          division: '전',
          doubleSideTop: toNumber(press[`weightPerAreaFront${i}M`]),
          doubleSideMiddle: toNumber(press[`weightPerAreaFront${i}C`]),
          doubleSideBottom: toNumber(press[`weightPerAreaFront${i}D`]),
          thicknessTop: toNumber(press[`thicknessFront${i}M`]),
          thicknessMiddle: toNumber(press[`thicknessFront${i}C`]),
          thicknessBottom: toNumber(press[`thicknessFront${i}D`]),
        });

        // 후단 행
        result.push({
          id: press.id,
          lot,
          division: '후',
          doubleSideTop: toNumber(press[`weightPerAreaRear${i}M`]),
          doubleSideMiddle: toNumber(press[`weightPerAreaRear${i}C`]),
          doubleSideBottom: toNumber(press[`weightPerAreaRear${i}D`]),
          thicknessTop: toNumber(press[`thicknessRear${i}M`]),
          thicknessMiddle: toNumber(press[`thicknessRear${i}C`]),
          thicknessBottom: toNumber(press[`thicknessRear${i}D`]),
        });
      }
    }

    return result;
  }

  async getVdWorklogData(projectId: number, electrode?: 'A' | 'C') {
    const vds = await this.worklogVdRepository.find({
      where: { project: { id: projectId } },
      order: { manufactureDate: 'DESC' },
    });

    const toNumber = (value: any) => (value != null ? Number(value) : null);
    const formatDate = (date: any) => {
      if (!date) return null;
      if (typeof date === 'string') return date.split('T')[0];
      if (date instanceof Date) return date.toISOString().split('T')[0];
      return null;
    };

    const result: any[] = [];

    for (const vd of vds) {
      // 상부 행
      const upperLots = [vd.upperLot1, vd.upperLot2, vd.upperLot3, vd.upperLot4, vd.upperLot5];

      // electrode 필터링 (LOT 5번째 문자 기준)
      const upperHasElectrode = !electrode || upperLots.some((lot) => lot && lot.charAt(4) === electrode);

      if (upperHasElectrode) {
        result.push({
          id: vd.id,
          workDate: formatDate(vd.manufactureDate),
          division: '상부',
          moisture1: toNumber(vd.upperMoistureMeasurement1),
          moisture2: toNumber(vd.upperMoistureMeasurement2),
          moisture3: toNumber(vd.upperMoistureMeasurement3),
          lot1: vd.upperLot1 ?? null,
          lot2: vd.upperLot2 ?? null,
          lot3: vd.upperLot3 ?? null,
          lot4: vd.upperLot4 ?? null,
          lot5: vd.upperLot5 ?? null,
        });
      }

      // 하부 행
      const lowerLots = [vd.lowerLot1, vd.lowerLot2, vd.lowerLot3, vd.lowerLot4, vd.lowerLot5];

      const lowerHasElectrode = !electrode || lowerLots.some((lot) => lot && lot.charAt(4) === electrode);

      if (lowerHasElectrode) {
        result.push({
          id: vd.id,
          workDate: formatDate(vd.manufactureDate),
          division: '하부',
          moisture1: toNumber(vd.lowerMoistureMeasurement1),
          moisture2: toNumber(vd.lowerMoistureMeasurement2),
          moisture3: toNumber(vd.lowerMoistureMeasurement3),
          lot1: vd.lowerLot1 ?? null,
          lot2: vd.lowerLot2 ?? null,
          lot3: vd.lowerLot3 ?? null,
          lot4: vd.lowerLot4 ?? null,
          lot5: vd.lowerLot5 ?? null,
        });
      }
    }

    return result;
  }

  async getFormationLotData(projectId: number) {
    const lots = await this.lotFormationRepository.find({
      where: { project: { id: projectId } },
      order: { lot: 'ASC' },
    });

    return lots.map((l) => ({
      lot: l.lot,
      pfc: l.pfc ?? null,
      pfd: l.pfd ?? null,
    }));
  }

  async getMainFormationLotData(projectId: number) {
    const lots = await this.lotFormationRepository.find({
      where: { project: { id: projectId } },
      order: { lot: 'ASC' },
    });

    return lots.map((l) => ({
      lot: l.lot,
      mfc: l.mfc ?? null,
      mfd: l.mfd ?? null,
      ocv1: l.ocv1 ?? null,
      ocv2: l.ocv2_7 ?? l.ocv2_4 ?? null,
    }));
  }

  async getFinalSealingWorklogData(projectId: number) {
    const formations = await this.worklogFormationRepository.find({
      where: { project: { id: projectId } },
      order: { manufactureDate: 'ASC' },
    });

    return formations.map((f) => ({
      id: f.id,
      workDate: f.manufactureDate,
      lot: f.lotRange ?? null,
      thicknesses: [
        f.sealingThickness1,
        f.sealingThickness2,
        f.sealingThickness3,
        f.sealingThickness4,
        f.sealingThickness5,
      ].filter((v) => v != null),
    }));
  }

  async getSealingWorklogData(projectId: number) {
    const sealings = await this.worklogSealingRepository.find({
      where: { project: { id: projectId } },
      order: { manufactureDate: 'ASC' },
    });

    // "번호 - v1/v2/v3/..." 형식 파싱 → { no, values }[]
    const parseChecklist = (checklist: string): { no: number | null; values: (number | null)[] }[] => {
      if (!checklist) return [];
      return checklist
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.includes('-'))
        .map((line) => {
          const [noPart, valuesPart] = line.split('-');
          const no = noPart.trim() !== '' ? Number(noPart.trim()) : null;
          const values = (valuesPart?.trim() ?? '').split('/').map((v) => (v.trim() !== '' ? Number(v.trim()) : null)) as (number | null)[];
          return { no, values };
        });
    };

    return sealings.map((sealing) => {
      const topRows = parseChecklist(sealing.topChecklist);
      const sideRows = parseChecklist(sealing.sideChecklist);

      // Top: 3행 각각에서 index 1, 2 (2번째, 3번째 값) 추출
      const topThickness = topRows.flatMap((row) => [row.values[1] ?? null, row.values[2] ?? null]);

      // Side: 1행(index 0) 전체 3개 + 3행(index 2) 전체 3개
      const sideThickness = [...(sideRows[0]?.values ?? [null, null, null]), ...(sideRows[2]?.values ?? [null, null, null])];

      const allRows = [...topRows, ...sideRows];
      const lot = allRows.length > 0 ? `${allRows[0].no}~${allRows[allRows.length - 1].no}` : null;

      return {
        id: sealing.id,
        workDate: sealing.manufactureDate,
        lot,
        sideSealing: sideThickness,
        topSealing: topThickness,
      };
    });
  }
}
