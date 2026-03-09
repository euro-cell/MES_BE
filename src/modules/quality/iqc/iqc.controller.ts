import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IqcService } from './iqc.service';
import { CreateIQCDto, UpdateIQCDto } from 'src/common/dtos/iqc.dto';

@ApiTags('Quality - IQC')
@Controller()
export class IqcController {
  constructor(private readonly iqcService: IqcService) {}

  @Get(':productionId')
  @ApiOperation({ summary: 'IQC 목록 조회' })
  async findAll(@Param('productionId') productionId: number) {
    return this.iqcService.findAll(productionId);
  }

  @Get('detail/:id')
  @ApiOperation({ summary: 'IQC 단건 조회' })
  async findOne(@Param('id') id: number) {
    return this.iqcService.findOne(id);
  }

  @Post(':productionId')
  @ApiOperation({
    summary: 'IQC 검사 이력 생성',
    description: 'results 중 isPassed=false 항목이 있으면 최종 합불(isPassed)이 자동으로 false로 설정됩니다.',
  })
  async create(@Param('productionId') productionId: number, @Body() dto: CreateIQCDto) {
    return this.iqcService.create(productionId, dto);
  }

  @Put('detail/:id')
  @ApiOperation({
    summary: 'IQC 검사 이력 수정',
    description: 'results / coaRefs / images를 전달하면 기존 데이터를 전체 교체합니다.',
  })
  async update(@Param('id') id: number, @Body() dto: UpdateIQCDto) {
    return this.iqcService.update(id, dto);
  }

  @Delete('detail/:id')
  @ApiOperation({ summary: 'IQC 검사 이력 삭제' })
  async remove(@Param('id') id: number) {
    return this.iqcService.remove(id);
  }
}
