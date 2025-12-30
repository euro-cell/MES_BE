import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LotFormation } from '../../../common/entities/lots/lot-08-formation.entity';
import { LotWelding } from '../../../common/entities/lots/lot-06-welding.entity';
import { LotStacking } from '../../../common/entities/lots/lot-05-stacking.entity';
import { LotNotching } from '../../../common/entities/lots/lot-04-notching.entity';
import { LotPress } from '../../../common/entities/lots/lot-03-press.entity';
import { LotCoating } from '../../../common/entities/lots/lot-02-coating.entity';
import { LotMixing } from '../../../common/entities/lots/lot-01-mixing.entity';
import { LotSealing } from '../../../common/entities/lots/lot-07-sealing.entity';
import { WorklogBinder } from '../../../common/entities/worklogs/worklog-01-binder.entity';
import { WorklogSlurry } from '../../../common/entities/worklogs/worklog-02-slurry.entity';
import { WorklogCoating } from '../../../common/entities/worklogs/worklog-03-coating.entity';
import { Material } from '../../../common/entities/material.entity';
import { MixingService } from './electrode/mixing.service';
import { CoatingService } from './electrode/coating.service';
import { PressService } from './electrode/press.service';
import { NotchingService } from './electrode/notching.service';
import { StackingService } from './assembly/stacking.service';
import { WeldingService } from './assembly/welding.service';
import { SealingLotService } from './assembly/sealing.service';
import { FormationLotService } from './formation/formation.service';

@Injectable()
export class LotService {
  constructor(
    @InjectRepository(LotFormation)
    private readonly lotFormationRepo: Repository<LotFormation>,
    @InjectRepository(LotWelding)
    private readonly lotWeldingRepo: Repository<LotWelding>,
    @InjectRepository(LotStacking)
    private readonly lotStackingRepo: Repository<LotStacking>,
    @InjectRepository(LotNotching)
    private readonly lotNotchingRepo: Repository<LotNotching>,
    @InjectRepository(LotMixing)
    private readonly lotMixingRepo: Repository<LotMixing>,
    @InjectRepository(LotSealing)
    private readonly lotSealingRepo: Repository<LotSealing>,
    @InjectRepository(WorklogBinder)
    private readonly worklogBinderRepo: Repository<WorklogBinder>,
    @InjectRepository(WorklogSlurry)
    private readonly worklogSlurryRepo: Repository<WorklogSlurry>,
    @InjectRepository(WorklogCoating)
    private readonly worklogCoatingRepo: Repository<WorklogCoating>,
    @InjectRepository(Material)
    private readonly materialRepo: Repository<Material>,
    private readonly mixingService: MixingService,
    private readonly coatingService: CoatingService,
    private readonly pressService: PressService,
    private readonly notchingService: NotchingService,
    private readonly stackingService: StackingService,
    private readonly weldingService: WeldingService,
    private readonly sealingService: SealingLotService,
    private readonly formationService: FormationLotService,
  ) {}

  async sync(productionId: number, process: string) {
    switch (process) {
      case 'mixing':
        return this.mixingService.sync(productionId);
      case 'coating':
        return this.coatingService.sync(productionId);
      case 'calendering':
        return this.pressService.sync(productionId);
      case 'notching':
        return this.notchingService.sync(productionId);
      case 'stacking':
        return this.stackingService.sync(productionId);
      case 'welding':
        return this.weldingService.sync(productionId);
      case 'sealing':
        return this.sealingService.sync(productionId);
      case 'formation':
        return this.formationService.sync(productionId);
      default:
        throw new BadRequestException(`지원하지 않는 공정입니다: ${process}`);
    }
  }

  async getLastSync(productionId: number, process: string) {
    switch (process) {
      case 'mixing':
        return this.mixingService.getLastSync(productionId);
      case 'coating':
        return this.coatingService.getLastSync(productionId);
      case 'calendering':
        return this.pressService.getLastSync(productionId);
      case 'notching':
        return this.notchingService.getLastSync(productionId);
      case 'stacking':
        return this.stackingService.getLastSync(productionId);
      case 'welding':
        return this.weldingService.getLastSync(productionId);
      case 'sealing':
        return this.sealingService.getLastSync(productionId);
      case 'formation':
        return this.formationService.getLastSync(productionId);
      default:
        throw new BadRequestException(`지원하지 않는 공정입니다: ${process}`);
    }
  }

  async searchProcessLots(lot: string) {
    // 1. Formation Lot 조회
    const formationLot = await this.lotFormationRepo.findOne({
      where: { lot },
      relations: ['production', 'lotSealing'],
      select: {
        production: { id: true, name: true },
        lotSealing: { id: true, lot: true, weldingLot: true, pouchLot: true, fillingDate: true, electrolyteLot: true },
      },
    });

    if (!formationLot) throw new NotFoundException('해당 lot을 찾을 수 없습니다');

    const production = formationLot.production;
    const lotSealing = formationLot.lotSealing;

    // 2. Welding Lot 조회 (lotSealing.weldingLot로 검색)
    let lotWelding: LotWelding | null = null;
    if (lotSealing?.weldingLot) {
      lotWelding = await this.lotWeldingRepo.findOne({
        where: { lot: lotSealing.weldingLot },
      });
    }

    // 3. Stacking Lot 조회 (lotWelding.stackingLot로 검색, worklogStacking 포함)
    let lotStacking: LotStacking | null = null;
    let matchedJr: { cathodeLot: string; anodeLot: string; separatorLot: string } | null = null;

    if (lotWelding?.stackingLot) {
      lotStacking = await this.lotStackingRepo.findOne({
        where: { lot: lotWelding.stackingLot },
        relations: ['worklogStacking'],
      });

      // 4. jrRange 매칭하여 cathode/anode/separator lot 추출
      if (lotStacking?.worklogStacking && lotStacking.jrRange) {
        const worklog = lotStacking.worklogStacking;
        const jrRange = lotStacking.jrRange;

        if (worklog.jr1Range === jrRange) {
          matchedJr = {
            cathodeLot: worklog.jr1CathodeLot,
            anodeLot: worklog.jr1AnodeLot,
            separatorLot: worklog.jr1SeparatorLot,
          };
        } else if (worklog.jr2Range === jrRange) {
          matchedJr = {
            cathodeLot: worklog.jr2CathodeLot,
            anodeLot: worklog.jr2AnodeLot,
            separatorLot: worklog.jr2SeparatorLot,
          };
        } else if (worklog.jr3Range === jrRange) {
          matchedJr = {
            cathodeLot: worklog.jr3CathodeLot,
            anodeLot: worklog.jr3AnodeLot,
            separatorLot: worklog.jr3SeparatorLot,
          };
        } else if (worklog.jr4Range === jrRange) {
          matchedJr = {
            cathodeLot: worklog.jr4CathodeLot,
            anodeLot: worklog.jr4AnodeLot,
            separatorLot: worklog.jr4SeparatorLot,
          };
        }
      }
    }

    // 5. 양극/음극 Notching → Press → Coating → Mixing 역추적
    let cathodeChain: {
      notching: LotNotching | null;
      press: LotPress | null;
      coating: LotCoating | null;
      mixing: LotMixing | null;
    } = { notching: null, press: null, coating: null, mixing: null };

    let anodeChain: {
      notching: LotNotching | null;
      press: LotPress | null;
      coating: LotCoating | null;
      mixing: LotMixing | null;
    } = { notching: null, press: null, coating: null, mixing: null };

    // 양극 (Cathode) 역추적
    if (matchedJr?.cathodeLot) {
      const notching = await this.lotNotchingRepo.findOne({
        where: { lot: matchedJr.cathodeLot },
        relations: ['lotPress', 'lotPress.lotCoating', 'lotPress.lotCoating.worklogSlurry'],
      });

      if (notching) {
        cathodeChain.notching = notching;
        cathodeChain.press = notching.lotPress || null;
        cathodeChain.coating = notching.lotPress?.lotCoating || null;

        // Coating의 worklogSlurry로 Mixing lot 찾기
        if (notching.lotPress?.lotCoating?.worklogSlurry) {
          const slurryLot = notching.lotPress.lotCoating.worklogSlurry.lot;
          if (slurryLot) {
            cathodeChain.mixing = await this.lotMixingRepo.findOne({
              where: { lot: slurryLot },
            });
          }
        }
      }
    }

    // 음극 (Anode) 역추적
    if (matchedJr?.anodeLot) {
      const notching = await this.lotNotchingRepo.findOne({
        where: { lot: matchedJr.anodeLot },
        relations: ['lotPress', 'lotPress.lotCoating', 'lotPress.lotCoating.worklogSlurry'],
      });

      if (notching) {
        anodeChain.notching = notching;
        anodeChain.press = notching.lotPress || null;
        anodeChain.coating = notching.lotPress?.lotCoating || null;

        // Coating의 worklogSlurry로 Mixing lot 찾기
        if (notching.lotPress?.lotCoating?.worklogSlurry) {
          const slurryLot = notching.lotPress.lotCoating.worklogSlurry.lot;
          if (slurryLot) {
            anodeChain.mixing = await this.lotMixingRepo.findOne({
              where: { lot: slurryLot },
            });
          }
        }
      }
    }

    // 6. processLots 응답 데이터 구성
    const processLots = [
      // Electrode 공정 (양/음극 분리)
      {
        category: 'Mixing',
        cathodeLot: cathodeChain.mixing?.lot || null,
        anodeLot: anodeChain.mixing?.lot || null,
      },
      {
        category: 'Coating',
        cathodeLot: cathodeChain.coating?.lot || null,
        anodeLot: anodeChain.coating?.lot || null,
      },
      {
        category: 'Calendering',
        cathodeLot: cathodeChain.press?.lot || null,
        anodeLot: anodeChain.press?.lot || null,
      },
      {
        category: 'Notching',
        cathodeLot: cathodeChain.notching?.lot || null,
        anodeLot: anodeChain.notching?.lot || null,
      },
      // Assembly 공정
      {
        category: 'Assembly',
        lot: lotStacking?.lot || null,
      },
      // Formation 공정
      {
        category: 'Formation',
        lot: formationLot.lot,
      },
    ];

    return {
      projectId: production?.id || null,
      projectName: production?.name || null,
      processLots,
    };
  }

  // 원자재 Lot 검색
  async searchRawMaterialLots(processResult: Awaited<ReturnType<typeof this.searchProcessLots>>) {
    const { processLots } = processResult;
    const rawMaterialLots: {
      category: string;
      material: string | null;
      product: string | null;
      spec: string | null;
      manufacturer: string | null;
      lot: string;
    }[] = [];

    // Helper: Material 테이블에서 lotNo로 material/product/spec/manufacturer 조회
    const getMaterialInfo = async (lotNo: string) => {
      if (!lotNo) return { material: null, product: null, spec: null, manufacturer: null };
      const mat = await this.materialRepo.findOne({ where: { lotNo } });
      return {
        material: mat?.category || null,
        product: mat?.type || null,
        spec: mat?.name || null,
        manufacturer: mat?.company || null,
      };
    };

    // 1. Mixing 원자재 조회 (Cathode/Anode)
    const mixingLot = processLots.find((p) => p.category === 'Mixing') as { cathodeLot: string; anodeLot: string } | undefined;
    if (mixingLot) {
      for (const [category, lot] of [
        ['Cathode', mixingLot.cathodeLot],
        ['Anode', mixingLot.anodeLot],
      ] as const) {
        if (!lot) continue;

        // WorklogBinder에서 조회 (바인더 원자재)
        const binder = await this.worklogBinderRepo.findOne({ where: { lot } });
        if (binder) {
          for (const i of [1, 2] as const) {
            const materialLot = binder[`material${i}Lot` as keyof WorklogBinder] as string;
            if (materialLot) {
              const info = await getMaterialInfo(materialLot);
              rawMaterialLots.push({
                category,
                material: info.material,
                product: info.product,
                spec: info.spec,
                manufacturer: info.manufacturer,
                lot: materialLot,
              });
            }
          }
        }

        // WorklogSlurry에서 조회 (슬러리 원자재 - NCM622, LCO, Conductor 등)
        const slurry = await this.worklogSlurryRepo.findOne({ where: { lot } });
        if (slurry) {
          for (const i of [1, 2, 3, 4, 5, 6, 7, 8] as const) {
            const materialLot = slurry[`material${i}Lot` as keyof WorklogSlurry] as string;
            if (materialLot) {
              const info = await getMaterialInfo(materialLot);
              rawMaterialLots.push({
                category,
                material: info.material,
                product: info.product,
                spec: info.spec,
                manufacturer: info.manufacturer,
                lot: materialLot,
              });
            }
          }
        }
      }
    }

    // 2. Coating 원자재 조회 (Cathode/Anode)
    const coatingLot = processLots.find((p) => p.category === 'Coating') as { cathodeLot: string; anodeLot: string } | undefined;
    if (coatingLot) {
      for (const [category, lot] of [
        ['Cathode', coatingLot.cathodeLot],
        ['Anode', coatingLot.anodeLot],
      ] as const) {
        if (!lot) continue;

        // WorklogCoating에서 coatingLot1~4 중 일치하는 것 찾기
        const coating = await this.worklogCoatingRepo
          .createQueryBuilder('wc')
          .where('wc.coatingLot1 = :lot OR wc.coatingLot2 = :lot OR wc.coatingLot3 = :lot OR wc.coatingLot4 = :lot', { lot })
          .getOne();

        if (coating) {
          // materialLot (Collector) - Slurry 제외
          if (coating.materialLot && coating.materialType?.toLowerCase() !== 'slurry') {
            const info = await getMaterialInfo(coating.materialLot);
            rawMaterialLots.push({
              category,
              material: info.material,
              product: info.product,
              spec: info.spec,
              manufacturer: info.manufacturer,
              lot: coating.materialLot,
            });
          }
          // materialLot2 - Slurry 제외
          if (coating.materialLot2 && coating.materialType2?.toLowerCase() !== 'slurry') {
            const info = await getMaterialInfo(coating.materialLot2);
            rawMaterialLots.push({
              category,
              material: info.material,
              product: info.product,
              spec: info.spec,
              manufacturer: info.manufacturer,
              lot: coating.materialLot2,
            });
          }
        }
      }
    }

    // 3. Assembly 원자재 조회
    const assemblyLot = processLots.find((p) => p.category === 'Assembly') as { lot: string } | undefined;
    if (assemblyLot?.lot) {
      const lot = assemblyLot.lot;

      // Stacking - separator
      const stacking = await this.lotStackingRepo.findOne({
        where: { lot },
        relations: ['worklogStacking'],
      });
      if (stacking?.worklogStacking) {
        const worklog = stacking.worklogStacking;
        const jrRange = stacking.jrRange;

        // jrRange에 맞는 separatorLot 선택
        let separatorLot: string | null = null;
        if (worklog.jr1Range === jrRange) separatorLot = worklog.jr1SeparatorLot;
        else if (worklog.jr2Range === jrRange) separatorLot = worklog.jr2SeparatorLot;
        else if (worklog.jr3Range === jrRange) separatorLot = worklog.jr3SeparatorLot;
        else if (worklog.jr4Range === jrRange) separatorLot = worklog.jr4SeparatorLot;

        if (separatorLot) {
          const info = await getMaterialInfo(separatorLot);
          rawMaterialLots.push({
            category: "Ass'y",
            material: info.material,
            product: info.product,
            spec: info.spec,
            manufacturer: info.manufacturer,
            lot: separatorLot,
          });
        }
      }

      // Welding - leadTab, piTape
      const welding = await this.lotWeldingRepo.findOne({
        where: { lot },
        relations: ['worklogWelding'],
      });
      if (welding?.worklogWelding) {
        const worklog = welding.worklogWelding;

        if (worklog.leadTabLot) {
          const info = await getMaterialInfo(worklog.leadTabLot);
          rawMaterialLots.push({
            category: "Ass'y",
            material: info.material,
            product: info.product,
            spec: info.spec,
            manufacturer: info.manufacturer,
            lot: worklog.leadTabLot,
          });
        }

        if (worklog.piTapeLot) {
          const info = await getMaterialInfo(worklog.piTapeLot);
          rawMaterialLots.push({
            category: "Ass'y",
            material: info.material,
            product: info.product,
            spec: info.spec,
            manufacturer: info.manufacturer,
            lot: worklog.piTapeLot,
          });
        }
      }

      // Sealing - pouch
      const sealing = await this.lotSealingRepo.findOne({
        where: { lot },
        relations: ['worklogSealing', 'worklogFilling'],
      });
      if (sealing?.worklogSealing?.pouchLot) {
        const info = await getMaterialInfo(sealing.worklogSealing.pouchLot);
        rawMaterialLots.push({
          category: "Ass'y",
          material: info.material,
          product: info.product,
          spec: info.spec,
          manufacturer: info.manufacturer,
          lot: sealing.worklogSealing.pouchLot,
        });
      }

      // Filling - electrolyte
      if (sealing?.worklogFilling?.electrolyteLot) {
        const info = await getMaterialInfo(sealing.worklogFilling.electrolyteLot);
        rawMaterialLots.push({
          category: "Ass'y",
          material: info.material,
          product: info.product,
          spec: info.spec,
          manufacturer: info.manufacturer,
          lot: sealing.worklogFilling.electrolyteLot,
        });
      }
    }

    return { rawMaterialLots };
  }
}
