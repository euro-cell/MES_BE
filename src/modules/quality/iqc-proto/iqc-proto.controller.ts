import { Controller, Post, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
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
}
