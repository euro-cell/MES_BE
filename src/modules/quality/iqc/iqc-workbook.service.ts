import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { IqcWorkbook } from '../../../common/entities/quality/iqc-workbook.entity';
import { RustfsService } from '../../../common/services/rustfs.service';
import { UniverCliService } from '../shared/univer-cli.service';

@Injectable()
export class IqcWorkbookService {
  constructor(
    @InjectRepository(IqcWorkbook)
    private readonly iqcWorkbookRepository: Repository<IqcWorkbook>,
    private readonly rustfsService: RustfsService,
    private readonly univerCliService: UniverCliService,
  ) {}

  async uploadAndConvert(iqcId: number, file: Express.Multer.File): Promise<{ workbookData: unknown }> {
    const { workbookData, originalName } = await this.univerCliService.convertXlsxToWorkbook(file);

    const existing = await this.iqcWorkbookRepository.findOne({ where: { iqcId } });

    const key = `iqc/${iqcId}/workbook/${randomUUID()}.json`;
    await this.rustfsService.upload(key, Buffer.from(JSON.stringify(workbookData)), 'application/json');

    if (existing) {
      await this.iqcWorkbookRepository.update(existing.id, { workbookDataPath: key, fileName: originalName });
      await this.rustfsService.delete(existing.workbookDataPath);
    } else {
      await this.iqcWorkbookRepository.save(
        this.iqcWorkbookRepository.create({ iqcId, workbookDataPath: key, fileName: originalName }),
      );
    }

    return { workbookData };
  }

  async getWorkbook(iqcId: number): Promise<{ workbookDataUrl: string | null; fileName?: string; uploadedAt?: Date }> {
    const record = await this.iqcWorkbookRepository.findOne({ where: { iqcId } });
    if (!record) {
      return { workbookDataUrl: null };
    }

    const workbookDataUrl = await this.rustfsService.getPresignedUrl(record.workbookDataPath);
    return { workbookDataUrl, fileName: record.fileName, uploadedAt: record.uploadedAt };
  }

  async convertToXlsx(workbookData: Record<string, unknown>): Promise<{ buffer: Buffer; fileName: string }> {
    return this.univerCliService.convertWorkbookToXlsx(workbookData);
  }

  async removeWorkbook(iqcId: number): Promise<void> {
    const record = await this.iqcWorkbookRepository.findOne({ where: { iqcId } });
    if (!record) return;

    await this.rustfsService.delete(record.workbookDataPath);
    await this.iqcWorkbookRepository.delete(record.id);
  }
}
