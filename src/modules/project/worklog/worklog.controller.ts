import { Controller, Get, Post, Param, Body, Res, StreamableFile } from '@nestjs/common';
import type { Response } from 'express';
import { ProcessTemplateFile, WorklogService } from './worklog.service';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { ExportWorklogRequestDto } from 'src/common/dtos/worklog/export-worklog.dto';

@Controller()
export class WorklogController {
  constructor(private readonly worklogService: WorklogService) {}

  @Get(':process')
  @ApiOperation({ summary: '공정별 작업일지 템플릿 파일 다운로드' })
  @ApiParam({ name: 'process', enum: Object.keys(ProcessTemplateFile), description: '공정명' })
  @ApiOkResponse({ description: '템플릿 파일 다운로드' })
  @ApiNotFoundResponse({ description: '템플릿 파일을 찾을 수 없습니다.' })
  async getProcessTemplate(@Res() res: Response, @Param('process') process: string) {
    return res.download(await this.worklogService.getTemplateFilePath(process));
  }

  @Post(':process/export')
  @ApiOperation({ summary: '다중 작업일지 Excel 내보내기' })
  @ApiParam({ name: 'process', enum: Object.keys(ProcessTemplateFile), description: '공정명' })
  @ApiBody({ type: ExportWorklogRequestDto })
  @ApiOkResponse({ description: 'Excel 파일 다운로드' })
  @ApiNotFoundResponse({ description: '작업일지를 찾을 수 없습니다.' })
  async exportWorklogs(
    @Res({ passthrough: true }) res: Response,
    @Param('process') process: string,
    @Body() dto: ExportWorklogRequestDto,
  ): Promise<StreamableFile> {
    const { file, productionName } = await this.worklogService.exportWorklogs(process, dto);
    const filename = this.worklogService.getExportFilename(process, productionName);

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      'Access-Control-Expose-Headers': 'Content-Disposition',
    });

    return file;
  }
}
