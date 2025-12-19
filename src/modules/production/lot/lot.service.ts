import { Injectable, BadRequestException } from '@nestjs/common';
import { MixingService } from './electrode/mixing.service';
import { CoatingService } from './electrode/coating.service';

@Injectable()
export class LotService {
  constructor(
    private readonly mixingService: MixingService,
    private readonly coatingService: CoatingService,
  ) {}

  async sync(productionId: number, process: string) {
    switch (process) {
      case 'mixing':
        return this.mixingService.sync(productionId);
      case 'coating':
        return this.coatingService.sync(productionId);
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
      default:
        throw new BadRequestException(`지원하지 않는 공정입니다: ${process}`);
    }
  }
}
