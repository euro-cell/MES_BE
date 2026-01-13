import { Injectable, NotFoundException } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class DrawingService {
  async getDrawingFilePath(
    category: string,
    location: string,
    floor: string,
  ): Promise<string> {
    const drawingPath = join(process.cwd(), 'data', 'drawings');
    const filePath = join(drawingPath, category, location, `${floor}.pdf`);

    if (!existsSync(filePath)) {
      throw new NotFoundException('도면 파일을 찾을 수 없습니다.');
    }

    return filePath;
  }
}
