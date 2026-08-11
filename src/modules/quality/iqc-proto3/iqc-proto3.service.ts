import { Injectable } from '@nestjs/common';
import { UniverCliService } from '../shared/univer-cli.service';

@Injectable()
export class IqcProto3Service {
  constructor(private readonly univerCliService: UniverCliService) {}

  async uploadAndGetViewerUrl(file: Express.Multer.File): Promise<{ viewerUrl: string; fileName: string }> {
    const { viewerUrl, originalName } = await this.univerCliService.convertXlsxToViewerUrl(file);
    return { viewerUrl, fileName: originalName };
  }
}
