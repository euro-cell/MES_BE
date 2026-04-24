import { Controller, Post, Param, Query, Get, Body, Res, StreamableFile, UseGuards } from '@nestjs/common';
import { LotService } from './lot.service';
import { ApiTags, ApiOperation, ApiQuery, ApiBody, ApiProduces } from '@nestjs/swagger';
import { RegisterRawDataDto } from '../../../common/dtos/lot/register-rawdata.dto';
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
import { SessionAuthGuard } from 'src/common/guards/session-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { RequirePermission } from 'src/common/decorators/permission.decorator';
import { MenuName, PermissionAction } from 'src/common/enums/menu.enum';

@ApiTags('Lot 관리')
@Controller(':projectId/lot')
@UseGuards(SessionAuthGuard, PermissionGuard)
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
  @RequirePermission(MenuName.LOT_MANAGEMENT, PermissionAction.CREATE)
  @ApiOperation({ summary: '데이터 갱신' })
  @ApiQuery({ name: 'process', required: true, description: '공정명 (mixing, coating, calendering, notching, stacking 등)' })
  async sync(@Param('projectId') projectId: number, @Query('process') process: string) {
    return this.lotService.sync(projectId, process);
  }

  @Get('sync')
  async getSync(@Param('projectId') projectId: number, @Query('process') process: string) {
    return await this.lotService.getLastSync(projectId, process);
  }

  @Get('mixing')
  async getMixingLots(@Param('projectId') projectId: number) {
    return this.mixingService.getMixingLots(projectId);
  }

  @Get('coating')
  async getCoatingLots(@Param('projectId') projectId: number) {
    return this.coatingService.getCoatingLots(projectId);
  }

  @Get('calendering')
  async getPressLots(@Param('projectId') projectId: number) {
    return this.pressService.getPressLots(projectId);
  }

  @Get('notching')
  async getNotchingLots(@Param('projectId') projectId: number) {
    return this.notchingService.getNotchingLots(projectId);
  }

  @Get('stacking')
  async getStackingLots(@Param('projectId') projectId: number) {
    return this.stackingService.getStackingLots(projectId);
  }

  @Get('welding')
  async getWeldingLots(@Param('projectId') projectId: number) {
    return this.weldingService.getWeldingLots(projectId);
  }

  @Get('sealing')
  async getSealingLots(@Param('projectId') projectId: number) {
    return this.sealingService.getSealingLots(projectId);
  }

  @Get('formation')
  async getFormation(@Param('projectId') projectId: number) {
    return this.formationService.getFormationLots(projectId);
  }

  @Post('rawdata')
  @RequirePermission(MenuName.LOT_MANAGEMENT, PermissionAction.CREATE)
  @ApiOperation({ summary: 'Formation Raw Data 등록' })
  @ApiBody({ type: RegisterRawDataDto })
  async registerRawData(@Param('projectId') projectId: number, @Body() dto: RegisterRawDataDto) {
    return this.formationService.registerRawData(projectId, dto);
  }

  @Get('export')
  @ApiOperation({ summary: 'Lot 관리 Excel 다운로드' })
  @ApiProduces('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  async exportLots(@Param('projectId') projectId: number, @Res() res: Response) {
    const file = await this.lotExportService.exportLots(projectId);
    const filename = `Lot_관리.xlsx`;

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      'Access-Control-Expose-Headers': 'Content-Disposition',
    });

    file.getStream().pipe(res);
  }
}
