import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { OqcService } from './oqc.service';
import { SaveOqcSpecDto } from 'src/common/dtos/quality/oqc-spec.dto';
import { SessionAuthGuard } from 'src/common/guards/session-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { RequirePermission } from 'src/common/decorators/permission.decorator';
import { MenuName, PermissionAction } from 'src/common/enums/menu.enum';

@ApiTags('Quality - OQC')
@Controller()
@UseGuards(SessionAuthGuard, PermissionGuard)
export class OqcController {
  constructor(private readonly oqcService: OqcService) {}

  @Get(':projectId/grading')
  @ApiOperation({ summary: 'Grading 데이터 목록 조회' })
  async getGradingData(@Param('projectId') projectId: number) {
    return this.oqcService.getGradingData(projectId);
  }

  @Get(':projectId/spec')
  @ApiOperation({ summary: 'OQC 규격 조회' })
  async getSpec(
    @Param('projectId') projectId: number,
    @Query('process') process?: string,
  ) {
    return this.oqcService.getSpec(projectId, process);
  }

  @Post(':projectId/spec')
  @RequirePermission(MenuName.OQC, PermissionAction.CREATE)
  @ApiOperation({ summary: 'OQC 규격 저장 (신규 생성 또는 업데이트)' })
  async upsertSpec(@Param('projectId') projectId: number, @Body() dto: SaveOqcSpecDto) {
    return this.oqcService.upsertSpec(projectId, dto);
  }
}
