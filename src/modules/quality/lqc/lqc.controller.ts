import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LqcService } from './lqc.service';
import { LqcProcessType, LqcItemType } from 'src/common/enums/lqc.enum';
import { CreateLqcSpecDto } from 'src/common/dtos/lqc-spec.dto';

@ApiTags('Quality - LQC')
@Controller()
export class LqcController {
  constructor(private readonly lqcService: LqcService) {}

  @Get(':productionId/spec')
  @ApiOperation({ summary: '프로젝트/공정별 LQC 규격 조회' })
  async getSpec(
    @Param('productionId') productionId: number,
    @Query('processType') processType?: LqcProcessType,
    @Query('itemType') itemType?: LqcItemType,
  ) {
    return this.lqcService.getSpec(productionId, processType, itemType);
  }

  @Post(':productionId/spec')
  @ApiOperation({ summary: 'LQC 규격 저장 (신규 생성 또는 업데이트)' })
  async upsertSpec(@Param('productionId') productionId: number, @Body() dto: CreateLqcSpecDto) {
    return this.lqcService.upsertSpec(productionId, dto);
  }

  @Get(':productionId/binder')
  @ApiOperation({ summary: '바인더 작업일지 데이터 조회 (고형분, 점도)' })
  async getBinderWorklogData(
    @Param('productionId') productionId: number,
    @Query('electrode') electrode?: 'A' | 'C',
  ) {
    return this.lqcService.getBinderWorklogData(productionId, electrode);
  }

  @Get(':productionId/slurry')
  @ApiOperation({ summary: '슬러리 작업일지 데이터 조회 (입도, 점도)' })
  async getSlurryWorklogData(
    @Param('productionId') productionId: number,
    @Query('electrode') electrode?: 'A' | 'C',
  ) {
    return this.lqcService.getSlurryWorklogData(productionId, electrode);
  }

  @Get(':productionId/coating')
  @ApiOperation({ summary: '코팅 작업일지 데이터 조회 (로딩량, 두께)' })
  async getCoatingWorklogData(
    @Param('productionId') productionId: number,
    @Query('electrode') electrode?: 'A' | 'C',
  ) {
    return this.lqcService.getCoatingWorklogData(productionId, electrode);
  }
}
