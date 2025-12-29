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

  //TODO 원자재 Lot 검색 (구현 예정)
  async searchRawMaterialLots(processResult: Awaited<ReturnType<typeof this.searchProcessLots>>) {
    const { processLots } = processResult;
    console.log('🚀 ~ processLots:', processLots);
    return {
      rawMaterialLots: [],
    };
  }
}
