import { Controller, Post, Param, Query, Get } from '@nestjs/common';
import { LotService } from './lot.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MixingService } from './electrode/mixing.service';
import { CoatingService } from './electrode/coating.service';
import { PressService } from './electrode/press.service';
import { NotchingService } from './electrode/notching.service';
import { StackingService } from './assembly/stacking.service';
import { WeldingService } from './assembly/welding.service';
import { SealingLotService } from './assembly/sealing.service';

@ApiTags('Lot 관리/검색')
@Controller(':productionId/lot')
export class LotController {
  constructor(
    private readonly lotService: LotService,
    private readonly mixingService: MixingService,
    private readonly coatingService: CoatingService,
    private readonly pressService: PressService,
    private readonly notchingService: NotchingService,
    private readonly stackingService: StackingService,
    private readonly weldingService: WeldingService,
    private readonly sealingService: SealingLotService,
  ) {}

  @Post('sync')
  @ApiOperation({ summary: '데이터 갱신' })
  @ApiQuery({ name: 'process', required: true, description: '공정명 (mixing, coating, calendering, notching, stacking 등)' })
  async sync(@Param('productionId') productionId: number, @Query('process') process: string) {
    return this.lotService.sync(productionId, process);
  }

  @Get('sync')
  async getSync(@Param('productionId') productionId: number, @Query('process') process: string) {
    return await this.lotService.getLastSync(productionId, process);
  }

  @Get('mixing')
  async getMixingLots(@Param('productionId') productionId: number) {
    return this.mixingService.getMixingLots(productionId);
  }

  @Get('coating')
  async getCoatingLots(@Param('productionId') productionId: number) {
    return this.coatingService.getCoatingLots(productionId);
  }

  @Get('calendering')
  async getPressLots(@Param('productionId') productionId: number) {
    return this.pressService.getPressLots(productionId);
  }

  @Get('notching')
  async getNotchingLots(@Param('productionId') productionId: number) {
    return this.notchingService.getNotchingLots(productionId);
  }

  @Get('stacking')
  async getStackingLots(@Param('productionId') productionId: number) {
    return this.stackingService.getStackingLots(productionId);
  }

  @Get('welding')
  async getWeldingLots(@Param('productionId') productionId: number) {
    return this.weldingService.getWeldingLots(productionId);
  }

  @Get('sealing')
  async getSealingLots(@Param('productionId') productionId: number) {
    return this.sealingService.getSealingLots(productionId);
  }
}
