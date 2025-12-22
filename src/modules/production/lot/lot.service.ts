import { Injectable, BadRequestException } from '@nestjs/common';
import { MixingService } from './electrode/mixing.service';
import { CoatingService } from './electrode/coating.service';
import { PressService } from './electrode/press.service';
import { NotchingService } from './electrode/notching.service';

@Injectable()
export class LotService {
  constructor(
    private readonly mixingService: MixingService,
    private readonly coatingService: CoatingService,
    private readonly pressService: PressService,
    private readonly notchingService: NotchingService,
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
      default:
        throw new BadRequestException(`지원하지 않는 공정입니다: ${process}`);
    }
  }
}
