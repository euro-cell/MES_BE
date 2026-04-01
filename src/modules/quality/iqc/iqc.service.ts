import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { IQC } from 'src/common/entities/quality/iqc.entity';
import { IQCResult } from 'src/common/entities/quality/iqc-result.entity';
import { IQCCoaRef } from 'src/common/entities/quality/iqc-coa-ref.entity';
import { IQCImage } from 'src/common/entities/quality/iqc-image.entity';
import { IQCFile } from 'src/common/entities/quality/iqc-file.entity';
import { CreateIQCDto, UpdateIQCDto } from 'src/common/dtos/iqc.dto';
import { RustfsService } from 'src/common/services/rustfs.service';

@Injectable()
export class IqcService {
  constructor(
    @InjectRepository(IQC)
    private readonly iqcRepository: Repository<IQC>,
    @InjectRepository(IQCImage)
    private readonly iqcImageRepository: Repository<IQCImage>,
    @InjectRepository(IQCFile)
    private readonly iqcFileRepository: Repository<IQCFile>,
    private readonly dataSource: DataSource,
    private readonly rustfsService: RustfsService,
  ) {}

  async findAll(projectId: number) {
    const iqcs = await this.iqcRepository.find({
      where: { project: { id: projectId } },
      relations: ['results', 'coaRefs', 'images', 'files'],
      order: { createdAt: 'ASC' },
    });

    return Promise.all(iqcs.map((iqc) => this.attachPresignedUrls(iqc)));
  }

  async findOne(id: number) {
    const iqc = await this.iqcRepository.findOne({
      where: { id },
      relations: ['project', 'results', 'coaRefs', 'images', 'files'],
    });

    if (!iqc) throw new NotFoundException(`IQC with ID ${id} not found`);

    return this.attachPresignedUrls(iqc);
  }

  private async attachPresignedUrls(iqc: IQC) {
    const images = await Promise.all(
      (iqc.images ?? []).map(async (img) => ({
        ...img,
        fileUrl: img.filePath ? await this.rustfsService.getPresignedUrl(img.filePath) : null,
      })),
    );

    const files = await Promise.all(
      (iqc.files ?? []).map(async (f) => ({
        ...f,
        fileUrl: f.filePath ? await this.rustfsService.getPresignedUrl(f.filePath) : null,
      })),
    );

    return { ...iqc, images, files };
  }

  async create(projectId: number, dto: CreateIQCDto): Promise<IQC> {
    return this.dataSource.transaction(async (manager) => {
      const iqc = manager.create(IQC, {
        project: { id: projectId },
        category: dto.category,
        type: dto.type,
        name: dto.name,
        manufacturer: dto.manufacturer ?? null,
        lotNo: dto.lotNo,
        usage: dto.usage ?? null,
        receiptDate: dto.receiptDate ? new Date(dto.receiptDate) : null,
        inspectionDate: dto.inspectionDate ? new Date(dto.inspectionDate) : null,
        inspector: dto.inspector ?? null,
        isPassed: dto.isPassed ?? true,
        remark: dto.remark ?? null,
        psdData: dto.psdData ?? null,
      });

      const savedIqc = await manager.save(IQC, iqc);

      if (dto.results && dto.results.length > 0) {
        const results = dto.results.map((r) => {
          const result = manager.create(IQCResult, {
            iqc: { id: savedIqc.id },
            category: r.category,
            item: r.item ?? null,
            unit: r.unit ?? null,
            spec: r.spec ?? null,
            refCoa: r.refCoa ?? null,
            refLastData: r.refLastData ?? null,
            sample1: r.sample1 ?? null,
            sample2: r.sample2 ?? null,
            sample3: r.sample3 ?? null,
            isPassed: r.isPassed,
            note: r.note ?? null,
          });
          result.calculateAverage();
          return result;
        });
        await manager.save(IQCResult, results);
      }

      if (dto.coaRefs && dto.coaRefs.length > 0) {
        const coaRefs = dto.coaRefs.map((c) =>
          manager.create(IQCCoaRef, {
            iqc: { id: savedIqc.id },
            attrName: c.attrName,
            attrValue: c.attrValue ?? null,
          }),
        );
        await manager.save(IQCCoaRef, coaRefs);
      }

      if (dto.images && dto.images.length > 0) {
        const images = dto.images.map((img) =>
          manager.create(IQCImage, {
            iqc: { id: savedIqc.id },
            imageType: img.imageType,
            imageLabel: img.imageLabel ?? null,
            filePath: img.filePath ?? null,
          }),
        );
        await manager.save(IQCImage, images);
      }

      await this.syncIsPassed(savedIqc.id, manager);

      return manager.findOneOrFail(IQC, {
        where: { id: savedIqc.id },
        relations: ['project', 'results', 'coaRefs', 'images', 'files'],
      });
    });
  }

  async update(id: number, dto: UpdateIQCDto): Promise<IQC> {
    return this.dataSource.transaction(async (manager) => {
      const iqc = await manager.findOne(IQC, {
        where: { id },
        relations: ['results', 'coaRefs', 'images'],
      });

      if (!iqc) {
        throw new NotFoundException(`IQC with ID ${id} not found`);
      }

      if (dto.category !== undefined) iqc.category = dto.category;
      if (dto.type !== undefined) iqc.type = dto.type;
      if (dto.name !== undefined) iqc.name = dto.name;
      if (dto.manufacturer !== undefined) iqc.manufacturer = dto.manufacturer ?? null;
      if (dto.lotNo !== undefined) iqc.lotNo = dto.lotNo;
      if (dto.usage !== undefined) iqc.usage = dto.usage ?? null;
      if (dto.receiptDate !== undefined) iqc.receiptDate = dto.receiptDate ? new Date(dto.receiptDate) : null;
      if (dto.inspectionDate !== undefined) iqc.inspectionDate = dto.inspectionDate ? new Date(dto.inspectionDate) : null;
      if (dto.inspector !== undefined) iqc.inspector = dto.inspector ?? null;
      if (dto.remark !== undefined) iqc.remark = dto.remark ?? null;
      if (dto.psdData !== undefined) iqc.psdData = dto.psdData && dto.psdData.length > 0 ? dto.psdData : null;

      await manager.save(IQC, iqc);

      if (dto.results !== undefined) {
        await manager.delete(IQCResult, { iqc: { id } });
        if (dto.results.length > 0) {
          const results = dto.results.map((r) => {
            const result = manager.create(IQCResult, {
              iqc: { id },
              category: r.category,
              item: r.item ?? null,
              unit: r.unit ?? null,
              spec: r.spec ?? null,
              refCoa: r.refCoa ?? null,
              refLastData: r.refLastData ?? null,
              sample1: r.sample1 ?? null,
              sample2: r.sample2 ?? null,
              sample3: r.sample3 ?? null,
              isPassed: r.isPassed,
              note: r.note ?? null,
            });
            result.calculateAverage();
            return result;
          });
          await manager.save(IQCResult, results);
        }
      }

      if (dto.coaRefs !== undefined) {
        await manager.delete(IQCCoaRef, { iqc: { id } });
        if (dto.coaRefs.length > 0) {
          const coaRefs = dto.coaRefs.map((c) =>
            manager.create(IQCCoaRef, {
              iqc: { id },
              attrName: c.attrName,
              attrValue: c.attrValue ?? null,
            }),
          );
          await manager.save(IQCCoaRef, coaRefs);
        }
      }

      if (dto.images !== undefined) {
        await manager.delete(IQCImage, { iqc: { id } });
        if (dto.images.length > 0) {
          const images = dto.images.map((img) =>
            manager.create(IQCImage, {
              iqc: { id },
              imageType: img.imageType,
              imageLabel: img.imageLabel ?? null,
              filePath: img.filePath ?? null,
            }),
          );
          await manager.save(IQCImage, images);
        }
      }

      await this.syncIsPassed(id, manager);

      return manager.findOneOrFail(IQC, {
        where: { id },
        relations: ['project', 'results', 'coaRefs', 'images', 'files'],
      });
    });
  }

  async remove(id: number): Promise<void> {
    const result = await this.iqcRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`IQC with ID ${id} not found`);
    }
  }

  async uploadImages(iqcId: number, imageType: string, files: Express.Multer.File[], imageLabel?: string): Promise<IQCImage[]> {
    const iqc = await this.iqcRepository.findOne({ where: { id: iqcId } });
    if (!iqc) throw new NotFoundException(`IQC with ID ${iqcId} not found`);

    const images = await Promise.all(
      files.map(async (file) => {
        const sanitizedType = imageType.replace(/[<>:"/\\|?*()]/g, '_');
        const { key } = await this.rustfsService.uploadFile(`iqc/${iqcId}/${sanitizedType}`, file);

        return this.iqcImageRepository.create({
          iqc: { id: iqcId },
          imageType,
          imageLabel: imageLabel ?? null,
          filePath: key,
        });
      }),
    );

    return this.iqcImageRepository.save(images);
  }

  async uploadFile(iqcId: number, fileType: string, file: Express.Multer.File): Promise<IQCFile> {
    const iqc = await this.iqcRepository.findOne({ where: { id: iqcId } });
    if (!iqc) throw new NotFoundException(`IQC with ID ${iqcId} not found`);

    const sanitizedType = fileType.replace(/[<>:"/\\|?*()]/g, '_');
    const { key } = await this.rustfsService.uploadFile(`iqc/${iqcId}/${sanitizedType}`, file);

    const iqcFile = this.iqcFileRepository.create({
      iqc: { id: iqcId },
      fileType,
      fileName: file.originalname,
      filePath: key,
    });

    return this.iqcFileRepository.save(iqcFile);
  }

  async removeFile(fileId: number): Promise<void> {
    const file = await this.iqcFileRepository.findOne({ where: { id: fileId } });
    if (!file) throw new NotFoundException(`IQC File with ID ${fileId} not found`);

    if (file.filePath) await this.rustfsService.delete(file.filePath);
    await this.iqcFileRepository.delete(fileId);
  }

  async updateImageLabel(imageId: number, imageLabel: string): Promise<IQCImage> {
    const image = await this.iqcImageRepository.findOne({ where: { id: imageId } });
    if (!image) throw new NotFoundException(`IQC Image with ID ${imageId} not found`);

    image.imageLabel = imageLabel;
    return this.iqcImageRepository.save(image);
  }

  async removeImage(imageId: number): Promise<void> {
    const image = await this.iqcImageRepository.findOne({ where: { id: imageId } });
    if (!image) throw new NotFoundException(`IQC Image with ID ${imageId} not found`);

    if (image.filePath) await this.rustfsService.delete(image.filePath);
    await this.iqcImageRepository.delete(imageId);
  }

  private async syncIsPassed(iqcId: number, manager: any): Promise<void> {
    const failCount = await manager.count(IQCResult, {
      where: { iqc: { id: iqcId }, isPassed: false },
    });

    await manager.update(IQC, iqcId, { isPassed: failCount === 0 });
  }
}
