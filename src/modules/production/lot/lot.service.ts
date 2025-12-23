import { Injectable, BadRequestException } from '@nestjs/common';
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
}
