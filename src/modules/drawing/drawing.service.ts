import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { mkdirSync, writeFileSync, readdirSync, readFileSync, rmSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { tmpdir } from 'os';
import { Drawing } from 'src/common/entities/drawing/drawing.entity';
import { DrawingVersion } from 'src/common/entities/drawing/drawing-version.entity';
import {
  CreateDrawingDto,
  CreateDrawingVersionDto,
  UpdateDrawingDto,
  UpdateDrawingVersionDto,
  DrawingSearchDto,
} from 'src/common/dtos/drawing.dto';
import { RustfsService } from 'src/common/services/rustfs.service';
import { convertPdfToImages } from 'src/common/utils/pdf-converter.util';

@Injectable()
export class DrawingService {
  private readonly logger = new Logger(DrawingService.name);

  constructor(
    @InjectRepository(Drawing)
    private readonly drawingRepository: Repository<Drawing>,
    @InjectRepository(DrawingVersion)
    private readonly versionRepository: Repository<DrawingVersion>,
    private readonly rustfsService: RustfsService,
  ) {}

  async findAll(searchDto: DrawingSearchDto) {
    const query = this.drawingRepository
      .createQueryBuilder('drawing')
      .leftJoin('drawing.versions', 'version')
      .select([
        'drawing.id AS id',
        'drawing.category AS category',
        'drawing.projectName AS "projectName"',
        'drawing.division AS division',
        'drawing.drawingNumber AS "drawingNumber"',
        'drawing.description AS description',
        'drawing.currentVersion AS "currentVersion"',
        'TO_CHAR(MAX(version.registrationDate), \'YYYY-MM-DD\') AS "latestRegistrationDate"',
      ])
      .where('drawing.deletedAt IS NULL')
      .groupBy('drawing.id');

    if (searchDto.category) {
      query.andWhere('drawing.category = :category', { category: searchDto.category });
    }

    return query.orderBy('drawing.id', 'DESC').getRawMany();
  }

  async findOne(id: number) {
    const drawing = await this.drawingRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['versions'],
    });

    if (!drawing) {
      throw new NotFoundException('도면을 찾을 수 없습니다.');
    }

    return {
      id: drawing.id,
      category: drawing.category,
      projectName: drawing.projectName,
      division: drawing.division,
      drawingNumber: drawing.drawingNumber,
      description: drawing.description,
      currentVersion: drawing.currentVersion,
      versions: await Promise.all(
        drawing.versions
          .sort((a, b) => b.version - a.version)
          .map(async (v) => ({
            id: v.id,
            version: v.version,
            drawingFileName: v.drawingFileName ?? null,
            drawingFilePath: v.drawingFilePath ?? null,
            drawingFileUrl: v.drawingFilePath ? await this.rustfsService.getPresignedUrl(v.drawingFilePath) : null,
            pdfFileNames: v.pdfFileNames ?? [],
            pdfFilePaths: v.pdfFilePaths ?? [],
            pdfFileUrls: v.pdfFilePaths ? await Promise.all(v.pdfFilePaths.map((k) => this.rustfsService.getPresignedUrl(k))) : [],
            imageFilePaths: v.imageFilePaths ?? [],
            imageFileUrls: v.imageFilePaths ? await Promise.all(v.imageFilePaths.map((k) => this.rustfsService.getPresignedUrl(k))) : [],
            registrationDate: new Date(v.registrationDate).toISOString().split('T')[0],
            changeNote: v.changeNote ?? null,
          })),
      ),
    };
  }

  async create(dto: CreateDrawingDto, files: { drawingFile?: Express.Multer.File[]; pdfFiles?: Express.Multer.File[] }) {
    const drawingNumber = dto.drawingNumber.trim();
    const projectName = dto.projectName.trim();
    const division = dto.division.trim();
    const version = dto.version;

    const drawingFile = files.drawingFile?.[0];
    const pdfFiles = files.pdfFiles || [];

    const existing = await this.drawingRepository.findOne({ where: { drawingNumber } });
    if (existing) {
      throw new ConflictException('이미 존재하는 도면 번호입니다.');
    }

    const drawing = this.drawingRepository.create({
      category: dto.category,
      projectName,
      division,
      drawingNumber,
      description: dto.description?.trim(),
      currentVersion: version,
    });

    const savedDrawing = await this.drawingRepository.save(drawing);

    const { drawingFilePath, drawingFileName, pdfFilePaths, pdfFileNames } = await this.uploadFilesToStorage(
      savedDrawing.id,
      savedDrawing.drawingNumber,
      version,
      dto.description?.trim() || '',
      drawingFile,
      pdfFiles,
    );

    const drawingVersion = new DrawingVersion();
    drawingVersion.drawing = savedDrawing;
    drawingVersion.version = version;
    drawingVersion.drawingFilePath = drawingFilePath ?? undefined;
    drawingVersion.drawingFileName = drawingFileName ?? undefined;
    drawingVersion.pdfFilePaths = pdfFilePaths ?? undefined;
    drawingVersion.pdfFileNames = pdfFileNames ?? undefined;
    drawingVersion.registrationDate = new Date(dto.registrationDate);
    drawingVersion.changeNote = dto.changeNote?.trim() ?? undefined;

    const savedVersion = await this.versionRepository.save(drawingVersion);

    if (pdfFilePaths && pdfFilePaths.length > 0) {
      this.convertAndUploadPdfImages(savedDrawing.id, savedVersion.id, pdfFilePaths).catch((err) => {
        this.logger.error(`PDF 이미지 변환 실패: ${err.message}`, err.stack);
      });
    }

    return this.findOne(savedDrawing.id);
  }

  async addVersion(
    drawingId: number,
    dto: CreateDrawingVersionDto,
    files: { drawingFile?: Express.Multer.File[]; pdfFiles?: Express.Multer.File[] },
  ) {
    const drawingFile = files.drawingFile?.[0];
    const pdfFiles = files.pdfFiles || [];

    const drawing = await this.drawingRepository.findOne({
      where: { id: drawingId, deletedAt: IsNull() },
    });

    if (!drawing) {
      throw new NotFoundException('도면을 찾을 수 없습니다.');
    }

    const { drawingFilePath, drawingFileName, pdfFilePaths, pdfFileNames } = await this.uploadFilesToStorage(
      drawing.id,
      drawing.drawingNumber,
      dto.version,
      drawing.description || '',
      drawingFile,
      pdfFiles,
    );

    const drawingVersion = new DrawingVersion();
    drawingVersion.drawing = drawing;
    drawingVersion.version = dto.version;
    drawingVersion.drawingFilePath = drawingFilePath ?? undefined;
    drawingVersion.drawingFileName = drawingFileName ?? undefined;
    drawingVersion.pdfFilePaths = pdfFilePaths ?? undefined;
    drawingVersion.pdfFileNames = pdfFileNames ?? undefined;
    drawingVersion.registrationDate = new Date(dto.registrationDate);
    drawingVersion.changeNote = dto.changeNote?.trim() ?? undefined;

    const savedVersion = await this.versionRepository.save(drawingVersion);

    drawing.currentVersion = dto.version;
    await this.drawingRepository.save(drawing);

    if (pdfFilePaths && pdfFilePaths.length > 0) {
      this.convertAndUploadPdfImages(drawing.id, savedVersion.id, pdfFilePaths).catch((err) => {
        this.logger.error(`PDF 이미지 변환 실패: ${err.message}`, err.stack);
      });
    }

    return this.findOne(drawing.id);
  }

  async update(id: number, dto: UpdateDrawingDto) {
    const drawing = await this.drawingRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!drawing) {
      throw new NotFoundException('도면을 찾을 수 없습니다.');
    }

    if (dto.category !== undefined) drawing.category = dto.category;
    if (dto.projectName !== undefined) drawing.projectName = dto.projectName.trim();
    if (dto.division !== undefined) drawing.division = dto.division.trim();
    if (dto.description !== undefined) drawing.description = dto.description?.trim();

    await this.drawingRepository.save(drawing);

    return this.findOne(id);
  }

  async remove(id: number) {
    const drawing = await this.drawingRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!drawing) {
      throw new NotFoundException('도면을 찾을 수 없습니다.');
    }

    await this.drawingRepository.softDelete(id);

    return { message: '도면이 삭제되었습니다.' };
  }

  async updateVersion(
    drawingId: number,
    versionId: number,
    dto: UpdateDrawingVersionDto,
    files: { drawingFile?: Express.Multer.File[]; pdfFiles?: Express.Multer.File[] },
  ) {
    const drawingFile = files.drawingFile?.[0];
    const pdfFiles = files.pdfFiles || [];

    const drawing = await this.drawingRepository.findOne({
      where: { id: drawingId, deletedAt: IsNull() },
    });

    if (!drawing) {
      throw new NotFoundException('도면을 찾을 수 없습니다.');
    }

    const version = await this.versionRepository.findOne({
      where: { id: versionId, drawing: { id: drawingId } },
    });

    if (!version) {
      throw new NotFoundException('버전을 찾을 수 없습니다.');
    }

    if (dto.changeNote !== undefined) {
      version.changeNote = dto.changeNote?.trim() ?? undefined;
    }

    if (drawingFile) {
      if (version.drawingFilePath) {
        await this.rustfsService.delete(version.drawingFilePath);
      }

      const { drawingFilePath, drawingFileName } = await this.uploadFilesToStorage(
        drawing.id,
        drawing.drawingNumber,
        version.version,
        drawing.description || '',
        drawingFile,
        undefined,
      );

      version.drawingFilePath = drawingFilePath ?? undefined;
      version.drawingFileName = drawingFileName ?? undefined;
    }

    if (pdfFiles.length > 0) {
      if (version.pdfFilePaths && version.pdfFilePaths.length > 0) {
        await this.rustfsService.deleteMany(version.pdfFilePaths);
      }
      if (version.imageFilePaths && version.imageFilePaths.length > 0) {
        await this.rustfsService.deleteMany(version.imageFilePaths);
      }

      const { pdfFilePaths, pdfFileNames } = await this.uploadFilesToStorage(
        drawing.id,
        drawing.drawingNumber,
        version.version,
        drawing.description || '',
        undefined,
        pdfFiles,
      );

      version.pdfFilePaths = pdfFilePaths ?? undefined;
      version.pdfFileNames = pdfFileNames ?? undefined;
      version.imageFilePaths = undefined;

      await this.versionRepository.save(version);

      if (pdfFilePaths && pdfFilePaths.length > 0) {
        this.convertAndUploadPdfImages(drawing.id, version.id, pdfFilePaths).catch((err) => {
          this.logger.error(`PDF 이미지 변환 실패: ${err.message}`, err.stack);
        });
      }
    } else {
      await this.versionRepository.save(version);
    }

    return this.findOne(drawingId);
  }

  async removeVersion(drawingId: number, versionId: number) {
    const drawing = await this.drawingRepository.findOne({
      where: { id: drawingId, deletedAt: IsNull() },
      relations: ['versions'],
    });

    if (!drawing) {
      throw new NotFoundException('도면을 찾을 수 없습니다.');
    }

    const version = await this.versionRepository.findOne({
      where: { id: versionId, drawing: { id: drawingId } },
    });

    if (!version) {
      throw new NotFoundException('버전을 찾을 수 없습니다.');
    }

    const keysToDelete: string[] = [];
    if (version.drawingFilePath) keysToDelete.push(version.drawingFilePath);
    if (version.pdfFilePaths) keysToDelete.push(...version.pdfFilePaths);
    if (version.imageFilePaths) keysToDelete.push(...version.imageFilePaths);
    if (keysToDelete.length > 0) await this.rustfsService.deleteMany(keysToDelete);

    await this.versionRepository.delete(versionId);

    const remainingVersions = drawing.versions.filter((v) => v.id !== versionId);
    if (remainingVersions.length > 0) {
      const latestVersion = remainingVersions.reduce((max, v) => (v.version > max.version ? v : max));
      drawing.currentVersion = latestVersion.version;
      await this.drawingRepository.save(drawing);
    }

    return this.findOne(drawingId);
  }

  /**
   * Multer 메모리 파일을 RustFS에 업로드하고 key를 반환
   */
  private async uploadFilesToStorage(
    drawingId: number,
    drawingNumber: string,
    version: number,
    description: string,
    drawingFile?: Express.Multer.File,
    pdfFiles?: Express.Multer.File[],
  ): Promise<{
    drawingFilePath: string | null;
    drawingFileName: string | null;
    pdfFilePaths: string[] | null;
    pdfFileNames: string[] | null;
  }> {
    const timestamp = Date.now();
    const sanitizedDescription = description.replace(/[<>:"/\\|?*]/g, '_');
    const prefix = `drawings/${drawingId}`;

    let drawingFilePath: string | null = null;
    let drawingFileName: string | null = null;

    if (drawingFile) {
      const drawingExt = extname(drawingFile.originalname);
      const savedName = `${drawingNumber}_v${version}_${sanitizedDescription}_${timestamp}${drawingExt}`;
      const key = `${prefix}/${savedName}`;
      await this.rustfsService.upload(key, drawingFile.buffer, drawingFile.mimetype);
      drawingFilePath = key;
      drawingFileName = `${drawingNumber}_V${version} (${sanitizedDescription})${drawingExt}`;
    }

    let pdfFilePaths: string[] | null = null;
    let pdfFileNames: string[] | null = null;

    if (pdfFiles && pdfFiles.length > 0) {
      pdfFilePaths = [];
      pdfFileNames = [];
      for (let i = 0; i < pdfFiles.length; i++) {
        const pdfFile = pdfFiles[i];
        const pdfExt = extname(pdfFile.originalname);
        const savedPdfName = `${drawingNumber}_v${version}_${sanitizedDescription}_${timestamp}_${i + 1}${pdfExt}`;
        const key = `${prefix}/${savedPdfName}`;
        await this.rustfsService.upload(key, pdfFile.buffer, pdfFile.mimetype);
        pdfFilePaths.push(key);
        pdfFileNames.push(`${drawingNumber}_V${version} (${sanitizedDescription})_${i + 1}${pdfExt}`);
      }
    }

    return { drawingFilePath, drawingFileName, pdfFilePaths, pdfFileNames };
  }

  /**
   * RustFS에서 PDF를 내려받아 임시 파일로 변환 후 이미지를 다시 RustFS에 업로드
   */
  private async convertAndUploadPdfImages(drawingId: number, versionId: number, pdfKeys: string[]): Promise<void> {
    const allImageKeys: string[] = [];
    const tmpBase = join(tmpdir(), `drawing-${drawingId}-v${versionId}-${Date.now()}`);
    mkdirSync(tmpBase, { recursive: true });

    try {
      for (let pdfIndex = 0; pdfIndex < pdfKeys.length; pdfIndex++) {
        const pdfKey = pdfKeys[pdfIndex];
        const tmpPdfPath = join(tmpBase, `pdf-${pdfIndex + 1}.pdf`);
        const tmpImageDir = join(tmpBase, `images-${pdfIndex + 1}`);
        mkdirSync(tmpImageDir, { recursive: true });

        try {
          // RustFS에서 PDF 다운로드 → 임시 파일
          const stream = await this.rustfsService.getStream(pdfKey);
          await new Promise<void>((resolve, reject) => {
            const chunks: Buffer[] = [];
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('end', () => {
              writeFileSync(tmpPdfPath, Buffer.concat(chunks));
              resolve();
            });
            stream.on('error', reject);
          });

          // PDF → 이미지 변환
          const imagePaths = await convertPdfToImages(tmpPdfPath, tmpImageDir, { scale: 2048, format: 'png' });

          // 변환된 이미지 → RustFS 업로드
          for (let imgIndex = 0; imgIndex < imagePaths.length; imgIndex++) {
            const imgPath = imagePaths[imgIndex];
            const imgBuffer = readFileSync(imgPath);
            const key = `drawings/${drawingId}/images/pdf-${pdfIndex + 1}/page-${imgIndex + 1}.png`;
            await this.rustfsService.upload(key, imgBuffer, 'image/png');
            allImageKeys.push(key);
          }

          this.logger.log(`PDF ${pdfIndex + 1} 변환 완료: ${imagePaths.length}페이지`);
        } catch (err) {
          this.logger.error(`PDF 변환 실패 (${pdfKey}): ${err.message}`);
        }
      }

      if (allImageKeys.length > 0) {
        await this.versionRepository.update(versionId, { imageFilePaths: allImageKeys });
        this.logger.log(`버전 ${versionId}에 이미지 경로 저장 완료: ${allImageKeys.length}개`);
      }
    } finally {
      // 임시 디렉토리 정리
      if (existsSync(tmpBase)) {
        rmSync(tmpBase, { recursive: true, force: true });
      }
    }
  }
}
