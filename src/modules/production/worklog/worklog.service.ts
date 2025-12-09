import { Injectable, NotFoundException } from '@nestjs/common';
import { join } from 'path';

export enum ProcessTemplateFile {
  binder = '01.Binder.xlsx',
  slurry = '02.Slurry.xlsx',
  coating = '03.Coating.xlsx',
  press = '04.Press.xlsx',
  notching = '06.Notching.xlsx',
  vd = '07.VD.xlsx',
  forming = '08.Forming.xlsx',
  stacking = '09.Stacking.xlsx',
  welding = '10.Welding.xlsx',
  sealing = '11.Sealing.xlsx',
  formation = '13.Formation.xlsx',
  grading = '14.Grading.xlsx',
}

@Injectable()
export class WorklogService {
  async getTemplateFilePath(processName: string): Promise<string> {
    try {
      const templatePath = join(process.cwd(), 'src', 'common', 'templates');

      const fileName = ProcessTemplateFile[processName.toLowerCase()];
      const filePath = join(templatePath, fileName);

      return filePath;
    } catch (error) {
      throw new NotFoundException('템플릿 파일을 찾을 수 없습니다.');
    }
  }
}
