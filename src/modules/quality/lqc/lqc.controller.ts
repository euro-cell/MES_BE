import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LqcService } from './lqc.service';
import { LqcProcessType, LqcItemType } from 'src/common/enums/lqc.enum';
import { CreateLqcSpecDto } from 'src/common/dtos/lqc-spec.dto';

@ApiTags('Quality - LQC')
@Controller()
export class LqcController {
  constructor(private readonly lqcService: LqcService) {}

  @Get(':projectId/spec')
  @ApiOperation({ summary: '프로젝트/공정별 LQC 규격 조회' })
  async getSpec(
    @Param('projectId') projectId: number,
    @Query('processType') processType?: LqcProcessType,
    @Query('itemType') itemType?: LqcItemType,
  ) {
    return this.lqcService.getSpec(projectId, processType, itemType);
  }

  @Post(':projectId/spec')
  @ApiOperation({ summary: 'LQC 규격 저장 (신규 생성 또는 업데이트)' })
  async upsertSpec(@Param('projectId') projectId: number, @Body() dto: CreateLqcSpecDto) {
    return this.lqcService.upsertSpec(projectId, dto);
  }

  @Get(':projectId/binder')
  @ApiOperation({ summary: '바인더 작업일지 데이터 조회 (고형분, 점도)' })
  async getBinderWorklogData(@Param('projectId') projectId: number, @Query('electrode') electrode?: 'A' | 'C') {
    return this.lqcService.getBinderWorklogData(projectId, electrode);
  }

  @Get(':projectId/slurry')
  @ApiOperation({ summary: '슬러리 작업일지 데이터 조회 (입도, 점도)' })
  async getSlurryWorklogData(@Param('projectId') projectId: number, @Query('electrode') electrode?: 'A' | 'C') {
    return this.lqcService.getSlurryWorklogData(projectId, electrode);
  }

  @Get(':projectId/coating')
  @ApiOperation({ summary: '코팅 작업일지 데이터 조회 (로딩량, 두께)' })
  async getCoatingWorklogData(@Param('projectId') projectId: number, @Query('electrode') electrode?: 'A' | 'C') {
    return this.lqcService.getCoatingWorklogData(projectId, electrode);
  }

  @Get(':projectId/press')
  @ApiOperation({ summary: '프레스 작업일지 데이터 조회 (면적밀도, 두께)' })
  async getPressWorklogData(@Param('projectId') projectId: number, @Query('electrode') electrode?: 'A' | 'C') {
    return this.lqcService.getPressWorklogData(projectId, electrode);
  }

  @Get(':projectId/vd')
  @ApiOperation({ summary: 'VD 작업일지 데이터 조회 (수분)' })
  async getVdWorklogData(@Param('projectId') projectId: number, @Query('electrode') electrode?: 'A' | 'C') {
    return this.lqcService.getVdWorklogData(projectId, electrode);
  }

  @Get(':projectId/sealing')
  @ApiOperation({ summary: '실링 작업일지 데이터 조회 (Side/Top 두께)' })
  async getSealingWorklogData(@Param('projectId') projectId: number) {
    return this.lqcService.getSealingWorklogData(projectId);
  }

  @Get(':projectId/final-sealing')
  @ApiOperation({ summary: '파이널 실링 작업일지 데이터 조회 (실링 두께)' })
  async getFinalSealingWorklogData(@Param('projectId') projectId: number) {
    return this.lqcService.getFinalSealingWorklogData(projectId);
  }

  @Get(':projectId/pre-formation')
  @ApiOperation({ summary: '포메이션 Lot 데이터 조회 (pfc, pfd)' })
  async getFormationLotData(@Param('projectId') projectId: number) {
    return this.lqcService.getFormationLotData(projectId);
  }

  @Get(':projectId/main-formation')
  @ApiOperation({ summary: '메인포메이션 Lot 데이터 조회 (mfc, mfd, ocv1, ocv2)' })
  async getMainFormationLotData(@Param('projectId') projectId: number) {
    return this.lqcService.getMainFormationLotData(projectId);
  }
}
