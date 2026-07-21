import { Body, Controller, Post, Res, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import { IqcProtoService } from './iqc-proto.service';
import { SessionAuthGuard } from 'src/common/guards/session-auth.guard';

@ApiTags('Quality - IQC Proto (Univer 뷰어 프로토타입)')
@Controller()
@UseGuards(SessionAuthGuard)
export class IqcProtoController {
  constructor(private readonly iqcProtoService: IqcProtoService) {}

  @Post('upload')
  @ApiOperation({ summary: 'IQC 엑셀 파일을 Univer 워크북 JSON(IWorkbookData)으로 변환' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    return this.iqcProtoService.convertToWorkbookData(file);
  }

  @Post('export')
  @ApiOperation({ summary: 'Univer 워크북 JSON(IWorkbookData)을 xlsx 파일로 변환하여 다운로드' })
  @ApiBody({ schema: { type: 'object', properties: { workbookData: { type: 'object' } } } })
  async export(@Body('workbookData') workbookData: Record<string, unknown>, @Res() res: Response) {
    const { buffer, fileName } = await this.iqcProtoService.convertToXlsx(workbookData);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
    });
    res.send(buffer);
  }
}
