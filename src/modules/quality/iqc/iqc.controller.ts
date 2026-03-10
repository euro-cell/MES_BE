import { Controller, Get, Post, Put, Delete, Body, Param, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { IqcService } from './iqc.service';
import { CreateIQCDto, UpdateIQCDto, UploadIQCImagesDto } from 'src/common/dtos/iqc.dto';
import { multerConfig } from 'src/common/configs/multer.config';

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

  @Post('detail/:id/images')
  @ApiOperation({
    summary: 'IQC 이미지 업로드',
    description: 'multipart/form-data로 이미지 파일을 업로드합니다. imageType 필드와 files를 함께 전송하세요.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadIQCImagesDto })
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 10 }], multerConfig))
  async uploadImages(
    @Param('id') id: number,
    @Body() dto: UploadIQCImagesDto,
    @UploadedFiles() uploaded: { files?: Express.Multer.File[] },
  ) {
    return this.iqcService.uploadImages(id, dto.imageType, uploaded.files ?? []);
  }

  @Delete('images/:imageId')
  @ApiOperation({ summary: 'IQC 이미지 삭제' })
  async removeImage(@Param('imageId') imageId: number) {
    return this.iqcService.removeImage(imageId);
  }
}
