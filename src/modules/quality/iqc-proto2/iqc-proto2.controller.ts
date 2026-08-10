import { Body, Controller, Delete, Get, Param, Post, Res, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import { IqcProto2Service } from './iqc-proto2.service';
import { SessionAuthGuard } from '../../../common/guards/session-auth.guard';

@ApiTags('Quality - IQC Proto2 (프로젝트 단위 워크북, Univer)')
@Controller()
@UseGuards(SessionAuthGuard)
export class IqcProto2Controller {
  constructor(private readonly iqcProto2Service: IqcProto2Service) {}

  @Post('detail/:projectId/workbook/upload')
  @ApiOperation({ summary: '프로젝트에 IQC 엑셀을 Univer 워크북으로 변환하여 등록' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  async upload(@Param('projectId') projectId: number, @UploadedFile() file: Express.Multer.File) {
    return this.iqcProto2Service.uploadAndConvert(projectId, file);
  }

  @Get('detail/:projectId/workbook')
  @ApiOperation({ summary: '프로젝트에 등록된 워크북 조회 (RustFS presigned URL 반환)' })
  async getLatest(@Param('projectId') projectId: number) {
    return this.iqcProto2Service.getWorkbook(projectId);
  }

  @Post('detail/:projectId/workbook/export')
  @ApiOperation({ summary: '워크북 JSON(IWorkbookData)을 xlsx 파일로 변환하여 다운로드' })
  @ApiBody({ schema: { type: 'object', properties: { workbookData: { type: 'object' } } } })
  async export(@Body('workbookData') workbookData: Record<string, unknown>, @Res() res: Response) {
    const { buffer, fileName } = await this.iqcProto2Service.convertToXlsx(workbookData);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${fileName.replace(/"/g, '')}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    });
    res.send(buffer);
  }

  @Delete('detail/:projectId/workbook')
  @ApiOperation({ summary: '프로젝트에 등록된 워크북 삭제' })
  async remove(@Param('projectId') projectId: number) {
    return this.iqcProto2Service.removeWorkbook(projectId);
  }
}
