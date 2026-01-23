import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { existsSync, mkdirSync, unlinkSync, renameSync } from 'fs';
import { join, extname } from 'path';
import { Drawing } from 'src/common/entities/drawing.entity';
import { DrawingVersion } from 'src/common/entities/drawing-version.entity';
import { CreateDrawingDto, DrawingSearchDto } from 'src/common/dtos/drawing.dto';

@Injectable()
export class DrawingService {
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
        "TO_CHAR(MAX(version.registrationDate), 'YYYY-MM-DD') AS \"latestRegistrationDate\"",
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
        .sort((a, b) => a.version - b.version)
        .map((v) => ({
          id: v.id,
          version: v.version,
          drawingFileName: v.drawingFileName ?? null,
          drawingFilePath: v.drawingFilePath ?? null,
          pdfFileNames: v.pdfFileNames ?? [],
          pdfFilePaths: v.pdfFilePaths ?? [],
          registrationDate: new Date(v.registrationDate).toISOString().split('T')[0],
          changeNote: v.changeNote ?? null,
        })),
    };
  }

  async create(
    dto: CreateDrawingDto,
    files: { drawingFile?: Express.Multer.File[]; pdfFiles?: Express.Multer.File[] },
  ) {
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

      await this.versionRepository.save(drawingVersion);

      return this.findOne(savedDrawing.id);
    } catch (error) {
      cleanupFiles();
      throw error;
    }
  }

  // multer에서 latin1으로 인코딩된 파일명을 UTF-8로 디코딩
  private decodeFileName(filename: string): string {
    return Buffer.from(filename, 'latin1').toString('utf8');
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
      drawingFileName = this.decodeFileName(drawingFile.originalname);
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
        pdfFileNames.push(this.decodeFileName(pdfFile.originalname));
        renameSync(pdfFile.path, pdfAbsPath);
      }
    }

    return { drawingFilePath, drawingFileName, pdfFilePaths, pdfFileNames };
  }
}
