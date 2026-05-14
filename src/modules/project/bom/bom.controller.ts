import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BomService } from './bom.service';
import { CreateBomTemplateDto, LinkBomTemplateDto } from 'src/common/dtos/bom/bom.dto';
import { SessionAuthGuard } from 'src/common/guards/session-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { RequirePermission } from 'src/common/decorators/permission.decorator';
import { MenuName, PermissionAction } from 'src/common/enums/menu.enum';

@ApiTags('BOM')
@Controller('bom')
@UseGuards(SessionAuthGuard, PermissionGuard)
export class BomController {
  constructor(private readonly bomService: BomService) {}

  @Post('templates')
  @RequirePermission(MenuName.MATERIAL_MANAGEMENT, PermissionAction.CREATE)
  @ApiOperation({ summary: 'BOM 템플릿 생성' })
  async createTemplate(@Body() dto: CreateBomTemplateDto) {
    return this.bomService.createTemplate(dto);
  }

  @Get('templates')
  @ApiOperation({ summary: 'BOM 템플릿 목록 조회' })
  async findAllTemplates() {
    return this.bomService.findAllTemplates();
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'BOM 템플릿 단건 조회 (행 포함)' })
  async findTemplateById(@Param('id', ParseIntPipe) id: number) {
    return this.bomService.findTemplateById(id);
  }

  @Post(':projectId/link')
  @RequirePermission(MenuName.MATERIAL_MANAGEMENT, PermissionAction.CREATE)
  @ApiOperation({ summary: '프로젝트에 BOM 템플릿 연결 (upsert)' })
  async linkTemplate(@Param('projectId', ParseIntPipe) projectId: number, @Body() dto: LinkBomTemplateDto) {
    return this.bomService.linkTemplate(projectId, dto);
  }

  @Get(':projectId')
  @ApiOperation({ summary: '프로젝트별 연결된 BOM 조회' })
  async findByProject(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.bomService.findByProject(projectId);
  }
}
