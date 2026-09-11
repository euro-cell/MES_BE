import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ProcessTemplateService } from './process-template.service';
import { CreateProcessTemplateDto, UpdateProcessTemplateDto } from '../../common/dtos/project/process-template.dto';
import { SessionAuthGuard } from '../../common/guards/session-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/permission.decorator';
import { MenuName, PermissionAction } from '../../common/enums/menu.enum';

@UseGuards(SessionAuthGuard, PermissionGuard)
@Controller('process-templates')
export class ProcessTemplateController {
  constructor(private readonly processTemplateService: ProcessTemplateService) {}

  @Get()
  async findAll() {
    return this.processTemplateService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.processTemplateService.findOne(id);
  }

  @Post()
  @RequirePermission(MenuName.PROCESS_TEMPLATE, PermissionAction.CREATE)
  async create(@Body() dto: CreateProcessTemplateDto) {
    return this.processTemplateService.create(dto);
  }

  @Patch(':id')
  @RequirePermission(MenuName.PROCESS_TEMPLATE, PermissionAction.UPDATE)
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProcessTemplateDto) {
    return this.processTemplateService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermission(MenuName.PROCESS_TEMPLATE, PermissionAction.DELETE)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.processTemplateService.remove(id);
  }
}
