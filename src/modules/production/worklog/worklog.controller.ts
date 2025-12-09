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
    const filePath = join(dirPath, '01.Binder.xlsx');
    return res.download(filePath, '01.Binder.xlsx');
  }

  @Get('slurry')
  async getSlurryTemplate(@Res() res: Response) {
    const dirPath = await this.worklogService.getTemplateFilePath();
    const filePath = join(dirPath, '02.Slurry.xlsx');
    return res.download(filePath, '02.Slurry.xlsx');
  }
}
