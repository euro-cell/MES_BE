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
}
