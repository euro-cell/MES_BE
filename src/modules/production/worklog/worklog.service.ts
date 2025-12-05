import { Injectable, NotFoundException } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class WorklogService {
  async getTemplateFilePath(): Promise<string> {
    const filePath = join(process.cwd(), 'src', 'common', 'templates');

    if (!existsSync(filePath)) {
      throw new NotFoundException('템플릿 파일을 찾을 수 없습니다.');
    }
    return filePath;
  }
}
