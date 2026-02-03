import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { existsSync, mkdirSync, unlinkSync, renameSync, rmSync } from 'fs';
import { join, extname } from 'path';
import { Drawing } from 'src/common/entities/drawing.entity';
import { DrawingVersion } from 'src/common/entities/drawing-version.entity';
import {
  CreateDrawingDto,
  CreateDrawingVersionDto,
  UpdateDrawingDto,
  UpdateDrawingVersionDto,
  DrawingSearchDto,
} from 'src/common/dtos/drawing.dto';
import { convertPdfToImages } from 'src/common/utils/pdf-converter.util';

@Injectable()
export class DrawingService {
  private readonly logger = new Logger(DrawingService.name);

  constructor(
    @InjectRepository(Drawing)
    private readonly drawingRepository: Repository<Drawing>,
    @InjectRepository(DrawingVersion)
    private readonly versionRepository: Repository<DrawingVersion>,
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

    // 응답 형식에 맞게 가공
    return {
      id: drawing.id,
      category: drawing.category,
      projectName: drawing.projectName,
      division: drawing.division,
      drawingNumber: drawing.drawingNumber,
      description: drawing.description,
      currentVersion: drawing.currentVersion,
      versions: drawing.versions
        .sort((a, b) => b.version - a.version)
        .map((v) => ({
          id: v.id,
          version: v.version,
          drawingFileName: v.drawingFileName ?? null,
          drawingFilePath: v.drawingFilePath ?? null,
          pdfFileNames: v.pdfFileNames ?? [],
          pdfFilePaths: v.pdfFilePaths ?? [],
          imageFilePaths: v.imageFilePaths ?? [],
          registrationDate: new Date(v.registrationDate).toISOString().split('T')[0],
          changeNote: v.changeNote ?? null,
        })),
    };
  }

  async create(dto: CreateDrawingDto, files: { drawingFile?: Express.Multer.File[]; pdfFiles?: Express.Multer.File[] }) {
    // 입력값 trim 처리
    const drawingNumber = dto.drawingNumber.trim();
    const projectName = dto.projectName.trim();
    const division = dto.division.trim();
    const version = dto.version;

    const drawingFile = files.drawingFile?.[0];
    const pdfFiles = files.pdfFiles || [];

    // 에러 발생 시 업로드된 파일 삭제 헬퍼
    const cleanupFiles = () => {
      if (drawingFile?.path && existsSync(drawingFile.path)) {
        unlinkSync(drawingFile.path);
      }
      for (const pdfFile of pdfFiles) {
        if (pdfFile?.path && existsSync(pdfFile.path)) {
          unlinkSync(pdfFile.path);
        }
      }
    };

    try {
      // 도면 번호 중복 체크
      const existing = await this.drawingRepository.findOne({
        where: { drawingNumber },
      });

      if (existing) {
        throw new ConflictException('이미 존재하는 도면 번호입니다.');
      }

      // 도면 생성
      const drawing = this.drawingRepository.create({
        category: dto.category,
        projectName,
        division,
        drawingNumber,
        description: dto.description?.trim(),
        currentVersion: version,
      });

      const savedDrawing = await this.drawingRepository.save(drawing);

      // 파일 이동
      const { drawingFilePath, drawingFileName, pdfFilePaths, pdfFileNames } = await this.moveFilesToDrawingDirectory(
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

      // PDF 파일들을 이미지로 변환 (비동기로 처리)
      if (pdfFilePaths && pdfFilePaths.length > 0) {
        this.convertPdfFilesToImages(savedDrawing.id, savedVersion.id, pdfFilePaths).catch((err) => {
          this.logger.error(`PDF 이미지 변환 실패: ${err.message}`, err.stack);
        });
      }

      return this.findOne(savedDrawing.id);
    } catch (error) {
      cleanupFiles();
      throw error;
    }
  }

  async addVersion(
    drawingId: number,
    dto: CreateDrawingVersionDto,
    files: { drawingFile?: Express.Multer.File[]; pdfFiles?: Express.Multer.File[] },
  ) {
    const drawingFile = files.drawingFile?.[0];
    const pdfFiles = files.pdfFiles || [];

    // 에러 발생 시 업로드된 파일 삭제 헬퍼
    const cleanupFiles = () => {
      if (drawingFile?.path && existsSync(drawingFile.path)) {
        unlinkSync(drawingFile.path);
      }
      for (const pdfFile of pdfFiles) {
        if (pdfFile?.path && existsSync(pdfFile.path)) {
          unlinkSync(pdfFile.path);
        }
      }
    };

    try {
      // 도면 조회
      const drawing = await this.drawingRepository.findOne({
        where: { id: drawingId, deletedAt: IsNull() },
      });

      if (!drawing) {
        throw new NotFoundException('도면을 찾을 수 없습니다.');
      }

      // 파일 이동
      const { drawingFilePath, drawingFileName, pdfFilePaths, pdfFileNames } = await this.moveFilesToDrawingDirectory(
        drawing.id,
        drawing.drawingNumber,
        dto.version,
        drawing.description || '',
        drawingFile,
        pdfFiles,
      );

      // 버전 생성
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

      // 도면의 currentVersion 업데이트
      drawing.currentVersion = dto.version;
      await this.drawingRepository.save(drawing);

      // PDF 파일들을 이미지로 변환 (비동기로 처리)
      if (pdfFilePaths && pdfFilePaths.length > 0) {
        this.convertPdfFilesToImages(drawing.id, savedVersion.id, pdfFilePaths).catch((err) => {
          this.logger.error(`PDF 이미지 변환 실패: ${err.message}`, err.stack);
        });
      }

      return this.findOne(drawing.id);
    } catch (error) {
      cleanupFiles();
      throw error;
    }
  }

  async update(id: number, dto: UpdateDrawingDto) {
    const drawing = await this.drawingRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!drawing) {
      throw new NotFoundException('도면을 찾을 수 없습니다.');
    }

    // 변경된 필드만 업데이트
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

    // 에러 발생 시 업로드된 파일 삭제 헬퍼
    const cleanupFiles = () => {
      if (drawingFile?.path && existsSync(drawingFile.path)) {
        unlinkSync(drawingFile.path);
      }
      for (const pdfFile of pdfFiles) {
        if (pdfFile?.path && existsSync(pdfFile.path)) {
          unlinkSync(pdfFile.path);
        }
      }
    };

    try {
      // 도면 조회
      const drawing = await this.drawingRepository.findOne({
        where: { id: drawingId, deletedAt: IsNull() },
      });

      if (!drawing) {
        throw new NotFoundException('도면을 찾을 수 없습니다.');
      }

      // 버전 조회
      const version = await this.versionRepository.findOne({
        where: { id: versionId, drawing: { id: drawingId } },
      });

      if (!version) {
        throw new NotFoundException('버전을 찾을 수 없습니다.');
      }

      // changeNote 업데이트
      if (dto.changeNote !== undefined) {
        version.changeNote = dto.changeNote?.trim() ?? undefined;
      }

      // 도면 파일 교체
      if (drawingFile) {
        // 기존 파일 삭제
        if (version.drawingFilePath) {
          const oldPath = join(process.cwd(), version.drawingFilePath);
          if (existsSync(oldPath)) {
            unlinkSync(oldPath);
          }
        }

        // 새 파일 저장
        const { drawingFilePath, drawingFileName } = await this.moveFilesToDrawingDirectory(
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

      // PDF 파일들 교체
      if (pdfFiles.length > 0) {
        // 기존 PDF 파일들 삭제
        if (version.pdfFilePaths && version.pdfFilePaths.length > 0) {
          for (const oldPdfPath of version.pdfFilePaths) {
            const fullPath = join(process.cwd(), oldPdfPath);
            if (existsSync(fullPath)) {
              unlinkSync(fullPath);
            }
          }
        }

        // 기존 이미지 파일들 삭제
        if (version.imageFilePaths && version.imageFilePaths.length > 0) {
          for (const oldImagePath of version.imageFilePaths) {
            const fullPath = join(process.cwd(), oldImagePath);
            if (existsSync(fullPath)) {
              unlinkSync(fullPath);
            }
          }
        }

        // 새 PDF 파일들 저장
        const { pdfFilePaths, pdfFileNames } = await this.moveFilesToDrawingDirectory(
          drawing.id,
          drawing.drawingNumber,
          version.version,
          drawing.description || '',
          undefined,
          pdfFiles,
        );

        version.pdfFilePaths = pdfFilePaths ?? undefined;
        version.pdfFileNames = pdfFileNames ?? undefined;
        version.imageFilePaths = undefined; // 이미지 경로 초기화

        await this.versionRepository.save(version);

        // PDF 파일들을 이미지로 변환 (비동기로 처리)
        if (pdfFilePaths && pdfFilePaths.length > 0) {
          this.convertPdfFilesToImages(drawing.id, version.id, pdfFilePaths).catch((err) => {
            this.logger.error(`PDF 이미지 변환 실패: ${err.message}`, err.stack);
          });
        }
      } else {
        await this.versionRepository.save(version);
      }

      return this.findOne(drawingId);
    } catch (error) {
      cleanupFiles();
      throw error;
    }
  }

  async removeVersion(drawingId: number, versionId: number) {
    // 도면 조회
    const drawing = await this.drawingRepository.findOne({
      where: { id: drawingId, deletedAt: IsNull() },
      relations: ['versions'],
    });

    if (!drawing) {
      throw new NotFoundException('도면을 찾을 수 없습니다.');
    }

    // 버전 조회
    const version = await this.versionRepository.findOne({
      where: { id: versionId, drawing: { id: drawingId } },
    });

    if (!version) {
      throw new NotFoundException('버전을 찾을 수 없습니다.');
    }

    // 파일 삭제
    if (version.drawingFilePath) {
      const drawingPath = join(process.cwd(), version.drawingFilePath);
      if (existsSync(drawingPath)) {
        unlinkSync(drawingPath);
      }
    }

    if (version.pdfFilePaths && version.pdfFilePaths.length > 0) {
      for (const pdfPath of version.pdfFilePaths) {
        const fullPath = join(process.cwd(), pdfPath);
        if (existsSync(fullPath)) {
          unlinkSync(fullPath);
        }
      }
    }

    // 이미지 파일 삭제
    if (version.imageFilePaths && version.imageFilePaths.length > 0) {
      for (const imagePath of version.imageFilePaths) {
        const fullPath = join(process.cwd(), imagePath);
        if (existsSync(fullPath)) {
          unlinkSync(fullPath);
        }
      }
    }

    // 버전 삭제
    await this.versionRepository.delete(versionId);

    // 남은 버전 중 최신 버전으로 currentVersion 업데이트
    const remainingVersions = drawing.versions.filter((v) => v.id !== versionId);
    if (remainingVersions.length > 0) {
      const latestVersion = remainingVersions.reduce((max, v) => (v.version > max.version ? v : max));
      drawing.currentVersion = latestVersion.version;
      await this.drawingRepository.save(drawing);
    }

    return this.findOne(drawingId);
  }

  // 파일을 도면 전용 디렉토리로 이동 (DB에는 상대경로 저장)
  private async moveFilesToDrawingDirectory(
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
    // 상대경로 (DB 저장용)
    const relativeDir = join('data', 'uploads', 'drawings', String(drawingId));
    // 절대경로 (파일 시스템 작업용)
    const absoluteDir = join(process.cwd(), relativeDir);

    // 디렉토리 생성
    if (!existsSync(absoluteDir)) {
      mkdirSync(absoluteDir, { recursive: true });
    }

    // 파일명 생성: 도면번호_버전_도면내용_timestamp.확장자
    const timestamp = Date.now();
    const sanitizedDescription = description.replace(/[<>:"/\\|?*]/g, '_');

    // 도면 파일 이동
    let drawingFilePath: string | null = null;
    let drawingFileName: string | null = null;
    if (drawingFile) {
      const drawingExt = extname(drawingFile.originalname);
      const savedDrawingFileName = `${drawingNumber}_v${version}_${sanitizedDescription}_${timestamp}${drawingExt}`;
      const drawingAbsPath = join(absoluteDir, savedDrawingFileName);
      drawingFilePath = join(relativeDir, savedDrawingFileName);
      // 파일명 자동 생성: 도면번호_V버전 (도면내용).확장자
      drawingFileName = `${drawingNumber}_V${version} (${sanitizedDescription})${drawingExt}`;
      renameSync(drawingFile.path, drawingAbsPath);
    }

    // PDF 파일들 이동
    let pdfFilePaths: string[] | null = null;
    let pdfFileNames: string[] | null = null;
    if (pdfFiles && pdfFiles.length > 0) {
      pdfFilePaths = [];
      pdfFileNames = [];
      for (let i = 0; i < pdfFiles.length; i++) {
        const pdfFile = pdfFiles[i];
        const pdfExt = extname(pdfFile.originalname);
        const savedPdfFileName = `${drawingNumber}_v${version}_${sanitizedDescription}_${timestamp}_${i + 1}${pdfExt}`;
        const pdfAbsPath = join(absoluteDir, savedPdfFileName);
        const pdfFilePath = join(relativeDir, savedPdfFileName);
        pdfFilePaths.push(pdfFilePath);
        // 파일명 자동 생성: 도면번호_V버전 (도면내용)_순번.확장자
        pdfFileNames.push(`${drawingNumber}_V${version} (${sanitizedDescription})_${i + 1}${pdfExt}`);
        renameSync(pdfFile.path, pdfAbsPath);
      }
    }

    return { drawingFilePath, drawingFileName, pdfFilePaths, pdfFileNames };
  }

  /**
   * PDF 파일들을 WebP 이미지로 변환하고 DB에 저장
   */
  private async convertPdfFilesToImages(drawingId: number, versionId: number, pdfFilePaths: string[]): Promise<void> {
    const allImagePaths: string[] = [];

    for (let pdfIndex = 0; pdfIndex < pdfFilePaths.length; pdfIndex++) {
      const pdfRelativePath = pdfFilePaths[pdfIndex];
      const pdfAbsolutePath = join(process.cwd(), pdfRelativePath);

      if (!existsSync(pdfAbsolutePath)) {
        this.logger.warn(`PDF 파일을 찾을 수 없음: ${pdfAbsolutePath}`);
        continue;
      }

      // 이미지 출력 디렉토리: data/uploads/drawings/{drawingId}/images/pdf-{index}
      const imageRelativeDir = join('data', 'uploads', 'drawings', String(drawingId), 'images', `pdf-${pdfIndex + 1}`);
      const imageAbsoluteDir = join(process.cwd(), imageRelativeDir);

      try {
        const imagePaths = await convertPdfToImages(pdfAbsolutePath, imageAbsoluteDir, {
          scale: 2048,
          format: 'png',
        });

        // 상대 경로로 변환하여 저장
        const relativeImagePaths = imagePaths.map((absPath) => {
          const relativePath = absPath.replace(process.cwd(), '').replace(/^[\\/]/, '');
          return relativePath;
        });

        allImagePaths.push(...relativeImagePaths);
        this.logger.log(`PDF ${pdfIndex + 1} 변환 완료: ${relativeImagePaths.length}페이지`);
      } catch (err) {
        this.logger.error(`PDF 변환 실패 (${pdfRelativePath}): ${err.message}`);
      }
    }

    // DB 업데이트
    if (allImagePaths.length > 0) {
      await this.versionRepository.update(versionId, {
        imageFilePaths: allImagePaths,
      });
      this.logger.log(`버전 ${versionId}에 이미지 경로 저장 완료: ${allImagePaths.length}개`);
    }
  }
}
