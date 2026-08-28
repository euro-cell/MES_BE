import { Injectable } from '@nestjs/common';
import { UniverCliService } from '../shared/univer-cli.service';

@Injectable()
export class IqcProto3Service {
  constructor(private readonly univerCliService: UniverCliService) {}

  /**
   * Univer Office SDK Developer Preview(@univerjs/preset-sheets-advanced)는 라이선스 값을
   * 서버가 안전하게 보관했다가 클라이언트에 내려주는 방식을 기대한다(Vite 빌드 환경변수로
   * 번들에 굳혀 넣지 않기 위함, univer-viewer-proxy.middleware.ts의 daemon 라이선스
   * 전달 방식과 같은 이유). daemon용으로 이미 발급받은 값을 그대로 재사용한다.
   */
  async uploadAndGetWorkbook(
    file: Express.Multer.File,
  ): Promise<{ workbookData: unknown; fileName: string; license: string }> {
    const { workbookData, originalName } = await this.univerCliService.convertXlsxToWorkbook(file);
    return { workbookData, fileName: originalName, license: process.env.UNIVER_LICENSE ?? '' };
  }
}
