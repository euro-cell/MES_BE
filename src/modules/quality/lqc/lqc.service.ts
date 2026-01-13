import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LqcSpec } from 'src/common/entities/lqc-spec.entity';
import { LqcProcessType, LqcItemType } from 'src/common/enums/lqc.enum';
import { CreateLqcSpecDto } from 'src/common/dtos/lqc-spec.dto';
import { WorklogBinder } from 'src/common/entities/worklogs/worklog-01-binder.entity';
import { WorklogSlurry } from 'src/common/entities/worklogs/worklog-02-slurry.entity';
import { WorklogCoating } from 'src/common/entities/worklogs/worklog-03-coating.entity';

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
  ) {}

  async getSpec(productionId: number, processType?: LqcProcessType, itemType?: LqcItemType): Promise<LqcSpec[]> {
    const query = this.lqcSpecRepository.createQueryBuilder('spec').where('spec.production_id = :productionId', { productionId });

    if (processType) {
      query.andWhere('spec.processType = :processType', { processType });
    }

    if (itemType) {
      query.andWhere('spec.itemType = :itemType', { itemType });
    }

    return query.getMany();
  }

  async upsertSpec(productionId: number, dto: CreateLqcSpecDto): Promise<LqcSpec> {
    const existing = await this.lqcSpecRepository.findOne({
      where: {
        production: { id: productionId },
        processType: dto.processType,
        itemType: dto.itemType,
      },
    });

    if (existing) {
      existing.specs = dto.specs;
      return this.lqcSpecRepository.save(existing);
    }

    const newSpec = this.lqcSpecRepository.create({
      production: { id: productionId },
      processType: dto.processType,
      itemType: dto.itemType,
      specs: dto.specs,
    });

    return this.lqcSpecRepository.save(newSpec);
  }

  async getBinderWorklogData(productionId: number, electrode?: 'A' | 'C') {
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
      .where('binder.production_id = :productionId', { productionId });

    if (electrode) {
      // LOT 5번째 인덱스(index 4)로 양극(C)/음극(A) 구분
      query.andWhere('SUBSTRING(binder.lot, 5, 1) = :electrode', { electrode });
    }

    query.orderBy('binder.manufactureDate', 'DESC');

    return query.getMany();
  }

  async getSlurryWorklogData(productionId: number, electrode?: 'A' | 'C') {
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
      .where('slurry.production_id = :productionId', { productionId });

    if (electrode) {
      query.andWhere('SUBSTRING(slurry.lot, 5, 1) = :electrode', { electrode });
    }

    query.orderBy('slurry.manufactureDate', 'DESC');

    return query.getMany();
  }

  async getCoatingWorklogData(productionId: number, electrode?: 'A' | 'C') {
    const coatings = await this.worklogCoatingRepository.find({
      where: { production: { id: productionId } },
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
}
