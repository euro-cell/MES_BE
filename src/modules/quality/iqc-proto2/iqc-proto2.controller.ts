import { Controller, Post, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { IqcProto2Service } from './iqc-proto2.service';
import { SessionAuthGuard } from '../../../common/guards/session-auth.guard';

@ApiTags('Quality - IQC Proto2 (Univer CLI daemon 뷰어 iframe 실험)')
@Controller()
@UseGuards(SessionAuthGuard)
export class IqcProto2Controller {
  constructor(private readonly iqcProto2Service: IqcProto2Service) {}

  @Post('upload')
  @ApiOperation({ summary: 'IQC 엑셀 파일을 Univer daemon에 import하고 뷰어 URL 반환' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    return this.iqcProto2Service.uploadAndGetViewerUrl(file);
  }
}
