import { Body, Controller, Delete, Get, Param, Post, Res, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import { IqcWorkbookService } from './iqc-workbook.service';
import { SessionAuthGuard } from '../../../common/guards/session-auth.guard';
import { PermissionGuard } from '../../../common/guards/permission.guard';
import { RequirePermission } from '../../../common/decorators/permission.decorator';
import { MenuName, PermissionAction } from '../../../common/enums/menu.enum';

@ApiTags('Quality - IQC 워크북 첨부(Univer)')
@Controller()
@UseGuards(SessionAuthGuard, PermissionGuard)
export class IqcWorkbookController {
  constructor(private readonly iqcWorkbookService: IqcWorkbookService) {}

  @Post('detail/:id/workbook/upload')
  @RequirePermission(MenuName.IQC, PermissionAction.CREATE)
  @ApiOperation({ summary: 'IQC 검사 항목에 원본 엑셀을 Univer 워크북으로 변환하여 첨부' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  async upload(@Param('id') id: number, @UploadedFile() file: Express.Multer.File) {
    return this.iqcWorkbookService.uploadAndConvert(id, file);
  }

  @Get('detail/:id/workbook')
  @ApiOperation({ summary: 'IQC 검사 항목에 첨부된 워크북 조회 (RustFS presigned URL 반환)' })
  async getLatest(@Param('id') id: number) {
    return this.iqcWorkbookService.getWorkbook(id);
  }

  @Post('detail/:id/workbook/export')
  @ApiOperation({ summary: '첨부된 워크북 JSON(IWorkbookData)을 xlsx 파일로 변환하여 다운로드' })
  @ApiBody({ schema: { type: 'object', properties: { workbookData: { type: 'object' } } } })
  async export(@Body('workbookData') workbookData: Record<string, unknown>, @Res() res: Response) {
    const { buffer, fileName } = await this.iqcWorkbookService.convertToXlsx(workbookData);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${fileName.replace(/"/g, '')}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    });
    res.send(buffer);
  }

  @Delete('detail/:id/workbook')
  @RequirePermission(MenuName.IQC, PermissionAction.DELETE)
  @ApiOperation({ summary: 'IQC 검사 항목에 첨부된 워크북 삭제' })
  async remove(@Param('id') id: number) {
    return this.iqcWorkbookService.removeWorkbook(id);
  }
}
