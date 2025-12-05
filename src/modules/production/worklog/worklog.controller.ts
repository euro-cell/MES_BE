import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { WorklogService } from './worklog.service';
import { join } from 'path';

@Controller()
export class WorklogController {
  constructor(private readonly worklogService: WorklogService) {}

  @Get('binder')
  async getBinderTemplate(@Res() res: Response) {
    const dirPath = await this.worklogService.getTemplateFilePath();
    const filePath = join(dirPath, 'binder.xlsx');
    return res.download(filePath, 'binder.xlsx');
  }
}
