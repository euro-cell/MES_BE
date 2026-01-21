import { Controller, Post, Param, Query, Get, Body, Res, StreamableFile } from '@nestjs/common';
import { LotService } from './lot.service';
import { ApiTags, ApiOperation, ApiQuery, ApiBody, ApiProduces } from '@nestjs/swagger';
import { RegisterLowDataDto } from '../../../common/dtos/lot/register-lowdata.dto';
import { MixingService } from './electrode/mixing.service';
import { CoatingService } from './electrode/coating.service';
import { PressService } from './electrode/press.service';
import { NotchingService } from './electrode/notching.service';
import { StackingService } from './assembly/stacking.service';
import { WeldingService } from './assembly/welding.service';
import { SealingLotService } from './assembly/sealing.service';
import { FormationLotService } from './formation/formation.service';
import { LotExportService } from './lot-export.service';
import type { Response } from 'express';

@ApiTags('Lot 관리')
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
    private readonly formationService: FormationLotService,
    private readonly lotExportService: LotExportService,
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

  @Get('formation')
  async getFormation(@Param('productionId') productionId: number) {
    return this.formationService.getFormationLots(productionId);
  }

  @Post('lowdata')
  @ApiOperation({ summary: 'Formation Low Data 등록' })
  @ApiBody({ type: RegisterLowDataDto })
  async registerLowData(@Param('productionId') productionId: number, @Body() dto: RegisterLowDataDto) {
    return this.formationService.registerLowData(productionId, dto);
  }

  @Get('export')
  @ApiOperation({ summary: 'Lot 관리 Excel 다운로드' })
  @ApiProduces('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  async exportLots(@Param('productionId') productionId: number, @Res() res: Response) {
    const file = await this.lotExportService.exportLots(productionId);
    const filename = `Lot_관리.xlsx`;

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      'Access-Control-Expose-Headers': 'Content-Disposition',
    });

    file.getStream().pipe(res);
  }
}
