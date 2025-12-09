import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ProcessTemplateFile, WorklogService } from './worklog.service';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';

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
}
