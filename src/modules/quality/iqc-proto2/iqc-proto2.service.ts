import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { IqcProto2Workbook } from '../../../common/entities/quality/iqc-proto2-workbook.entity';
import { RustfsService } from '../../../common/services/rustfs.service';
import { UniverCliService } from '../shared/univer-cli.service';

@Injectable()
export class IqcProto2Service {
  constructor(
    @InjectRepository(IqcProto2Workbook)
    private readonly iqcProto2WorkbookRepository: Repository<IqcProto2Workbook>,
    private readonly rustfsService: RustfsService,
    private readonly univerCliService: UniverCliService,
  ) {}

  async uploadAndConvert(projectId: number, file: Express.Multer.File): Promise<{ workbookData: unknown }> {
    const { workbookData, originalName } = await this.univerCliService.convertXlsxToWorkbook(file);

    const existing = await this.iqcProto2WorkbookRepository.findOne({ where: { projectId } });

    const key = `iqc-proto2/${projectId}/workbook/${randomUUID()}.json`;
    await this.rustfsService.upload(key, Buffer.from(JSON.stringify(workbookData)), 'application/json');

    if (existing) {
      await this.iqcProto2WorkbookRepository.update(existing.id, { workbookDataPath: key, fileName: originalName });
      await this.rustfsService.delete(existing.workbookDataPath);
    } else {
      await this.iqcProto2WorkbookRepository.save(
        this.iqcProto2WorkbookRepository.create({ projectId, workbookDataPath: key, fileName: originalName }),
      );
    }

    return { workbookData };
  }

  async getWorkbook(projectId: number): Promise<{ workbookDataUrl: string | null; fileName?: string; uploadedAt?: Date }> {
    const record = await this.iqcProto2WorkbookRepository.findOne({ where: { projectId } });
    if (!record) {
      return { workbookDataUrl: null };
    }

    const workbookDataUrl = await this.rustfsService.getPresignedUrl(record.workbookDataPath);
    return { workbookDataUrl, fileName: record.fileName, uploadedAt: record.uploadedAt };
  }

  async convertToXlsx(workbookData: Record<string, unknown>): Promise<{ buffer: Buffer; fileName: string }> {
    return this.univerCliService.convertWorkbookToXlsx(workbookData);
  }

  async removeWorkbook(projectId: number): Promise<void> {
    const record = await this.iqcProto2WorkbookRepository.findOne({ where: { projectId } });
    if (!record) return;

    await this.rustfsService.delete(record.workbookDataPath);
    await this.iqcProto2WorkbookRepository.delete(record.id);
  }
}
