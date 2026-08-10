import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { IqcProtoWorkbook } from '../../../common/entities/quality/iqc-proto-workbook.entity';
import { RustfsService } from '../../../common/services/rustfs.service';
import { UniverCliService } from '../shared/univer-cli.service';

@Injectable()
export class IqcProtoService {
  constructor(
    @InjectRepository(IqcProtoWorkbook)
    private readonly iqcProtoWorkbookRepository: Repository<IqcProtoWorkbook>,
    private readonly rustfsService: RustfsService,
    private readonly univerCliService: UniverCliService,
  ) {}

  async convertToXlsx(workbookData: Record<string, unknown>): Promise<{ buffer: Buffer; fileName: string }> {
    return this.univerCliService.convertWorkbookToXlsx(workbookData);
  }

  async convertToWorkbookData(file: Express.Multer.File): Promise<{ workbookData: unknown }> {
    const { workbookData, originalName } = await this.univerCliService.convertXlsxToWorkbook(file);

    const existing = await this.iqcProtoWorkbookRepository.findOne({ where: {} });

    const key = `iqc-proto/workbook/${randomUUID()}.json`;
    await this.rustfsService.upload(key, Buffer.from(JSON.stringify(workbookData)), 'application/json');

    await this.iqcProtoWorkbookRepository.clear();
    await this.iqcProtoWorkbookRepository.save(
      this.iqcProtoWorkbookRepository.create({ workbookDataPath: key, fileName: originalName }),
    );

    if (existing) {
      await this.rustfsService.delete(existing.workbookDataPath);
    }

    return { workbookData };
  }

  async getLatestWorkbook(): Promise<{ workbookDataUrl: string | null; fileName?: string; uploadedAt?: Date }> {
    const latest = await this.iqcProtoWorkbookRepository.findOne({ where: {}, order: { uploadedAt: 'DESC' } });
    if (!latest) {
      return { workbookDataUrl: null };
    }

    const workbookDataUrl = await this.rustfsService.getPresignedUrl(latest.workbookDataPath);
    return { workbookDataUrl, fileName: latest.fileName, uploadedAt: latest.uploadedAt };
  }
}
