import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { WorklogService } from './worklog.service';
import { join } from 'path';

const processTemplateFile = {
  binder: '01.Binder.xlsx',
  slurry: '02.Slurry.xlsx',
  coating: '03.Coating.xlsx',
  press: '04.Press.xlsx',
  notching: '06.Notching.xlsx',
  vd: '07.VD.xlsx',
  forming: '08.Forming.xlsx',
  stacking: '09.Stacking.xlsx',
  welding: '10.Welding.xlsx',
  sealing: '11.Sealing.xlsx',
  formation: '13.Formation.xlsx',
  grading: '14.Grading.xlsx',
};

@Controller()
export class WorklogController {
  constructor(private readonly worklogService: WorklogService) {}

  @Get(':process')
  async getProcessTemplate(@Res() res: Response, @Param('process') process: string) {
    const dirPath = await this.worklogService.getTemplateFilePath();
    const fileName = processTemplateFile[process.toLowerCase()];
    const filePath = join(dirPath, fileName);
    return res.download(filePath, fileName);
  }
}
