import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { copyFileSync, existsSync, mkdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { IQC } from 'src/common/entities/iqc.entity';
import { IQCResult } from 'src/common/entities/iqc-result.entity';
import { IQCCoaRef } from 'src/common/entities/iqc-coa-ref.entity';
import { IQCImage } from 'src/common/entities/iqc-image.entity';
import { IQCFile } from 'src/common/entities/iqc-file.entity';
import { CreateIQCDto, UpdateIQCDto } from 'src/common/dtos/iqc.dto';


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
  ) {}

  async findAll(productionId: number): Promise<IQC[]> {
    return this.iqcRepository.find({
      where: { production: { id: productionId } },
      relations: ['results', 'coaRefs', 'images', 'files'],
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: number): Promise<IQC> {
    const iqc = await this.iqcRepository.findOne({
      where: { id },
      relations: ['production', 'results', 'coaRefs', 'images', 'files'],
    });

    if (!iqc) throw new NotFoundException(`IQC with ID ${id} not found`);

    return iqc;
  }

  async create(productionId: number, dto: CreateIQCDto): Promise<IQC> {
    return this.dataSource.transaction(async (manager) => {
      // 1. IQC 기본 정보 저장
      const iqc = manager.create(IQC, {
        production: { id: productionId },
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

      // 2. 검사 결과 저장
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

      // 3. CoA 참조 저장
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

      // 4. 이미지 저장
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

      // 5. 결과 기반 최종 합불 자동 업데이트
      await this.syncIsPassed(savedIqc.id, manager);

      return manager.findOneOrFail(IQC, {
        where: { id: savedIqc.id },
        relations: ['production', 'results', 'coaRefs', 'images', 'files'],
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

      // 1. 기본 정보 업데이트
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

      // 2. 결과 교체 (전달 시)
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

      // 3. CoA 참조 교체 (전달 시)
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

      // 4. 이미지 교체 (전달 시)
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

      // 5. 결과 기반 최종 합불 자동 업데이트
      await this.syncIsPassed(id, manager);

      return manager.findOneOrFail(IQC, {
        where: { id },
        relations: ['production', 'results', 'coaRefs', 'images', 'files'],
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

    const relativeDir = join('data', 'uploads', 'iqc', String(iqcId));
    const absoluteDir = join(process.cwd(), relativeDir);

    if (!existsSync(absoluteDir)) {
      mkdirSync(absoluteDir, { recursive: true });
    }

    const images = files.map((file) => {
      const timestamp = Date.now();
      const sanitizedType = imageType.replace(/[<>:"/\\|?*()]/g, '_');
      const sanitizedName = file.originalname.replace(/[<>:"/\\|?*()]/g, '_');
      const fileName = `${sanitizedType}_${timestamp}_${sanitizedName}`;
      const absolutePath = join(absoluteDir, fileName);
      const filePath = join(relativeDir, fileName).replace(/\\/g, '/');

      copyFileSync(file.path, absolutePath);
      unlinkSync(file.path);

      return this.iqcImageRepository.create({
        iqc: { id: iqcId },
        imageType,
        imageLabel: imageLabel ?? null,
        filePath,
      });
    });

    return this.iqcImageRepository.save(images);
  }

  async uploadFile(iqcId: number, fileType: string, file: Express.Multer.File): Promise<IQCFile> {
    const iqc = await this.iqcRepository.findOne({ where: { id: iqcId } });

    if (!iqc) throw new NotFoundException(`IQC with ID ${iqcId} not found`);

    const relativeDir = join('data', 'uploads', 'iqc', String(iqcId));
    const absoluteDir = join(process.cwd(), relativeDir);

    if (!existsSync(absoluteDir)) {
      mkdirSync(absoluteDir, { recursive: true });
    }

    const timestamp = Date.now();
    const sanitizedType = fileType.replace(/[<>:"/\\|?*()]/g, '_');
    const sanitizedName = file.originalname.replace(/[<>:"/\\|?*()]/g, '_');
    const fileName = `${sanitizedType}_${timestamp}_${sanitizedName}`;
    const absolutePath = join(absoluteDir, fileName);
    const filePath = join(relativeDir, fileName).replace(/\\/g, '/');

    copyFileSync(file.path, absolutePath);
    unlinkSync(file.path);

    const iqcFile = this.iqcFileRepository.create({
      iqc: { id: iqcId },
      fileType,
      fileName: file.originalname,
      filePath,
    });

    return this.iqcFileRepository.save(iqcFile);
  }

  async removeFile(fileId: number): Promise<void> {
    const file = await this.iqcFileRepository.findOne({ where: { id: fileId } });

    if (!file) throw new NotFoundException(`IQC File with ID ${fileId} not found`);

    if (file.filePath) {
      const absolutePath = join(process.cwd(), file.filePath);
      if (existsSync(absolutePath)) {
        unlinkSync(absolutePath);
      }
    }

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

    if (image.filePath) {
      const absolutePath = join(process.cwd(), image.filePath);
      if (existsSync(absolutePath)) {
        unlinkSync(absolutePath);
      }
    }

    await this.iqcImageRepository.delete(imageId);
  }

  /**
   * results 중 isPassed=false 항목이 하나라도 있으면 iqc.isPassed를 false로 업데이트
   */
  private async syncIsPassed(iqcId: number, manager: any): Promise<void> {
    const failCount = await manager.count(IQCResult, {
      where: { iqc: { id: iqcId }, isPassed: false },
    });

    await manager.update(IQC, iqcId, { isPassed: failCount === 0 });
  }
}
