import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { existsSync, mkdirSync, unlinkSync, renameSync } from 'fs';
import { join, extname } from 'path';
import { Drawing } from 'src/common/entities/drawing.entity';
import { DrawingVersion } from 'src/common/entities/drawing-version.entity';
import { CreateDrawingDto, UpdateDrawingDto, DrawingSearchDto } from 'src/common/dtos/drawing.dto';
import { CreateDrawingVersionDto } from 'src/common/dtos/drawing-version.dto';

@Injectable()
export class DrawingService {
  constructor(
    @InjectRepository(Drawing)
    private readonly drawingRepository: Repository<Drawing>,
    @InjectRepository(DrawingVersion)
    private readonly versionRepository: Repository<DrawingVersion>,
  ) {}

  async findAll(searchDto: DrawingSearchDto): Promise<Drawing[]> {
    const query = this.drawingRepository
      .createQueryBuilder('drawing')
      .leftJoinAndSelect('drawing.versions', 'versions')
      .where('drawing.deletedAt IS NULL');

    if (searchDto.category) {
      query.andWhere('drawing.category = :category', { category: searchDto.category });
    }

    if (searchDto.projectName) {
      query.andWhere('drawing.projectName LIKE :projectName', { projectName: `%${searchDto.projectName}%` });
    }

    if (searchDto.drawingNumber) {
      query.andWhere('drawing.drawingNumber LIKE :drawingNumber', { drawingNumber: `%${searchDto.drawingNumber}%` });
    }

    return query.orderBy('drawing.id', 'DESC').getMany();
  }

  async findOne(id: number): Promise<Drawing> {
    const drawing = await this.drawingRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['versions'],
    });

    if (!drawing) {
      throw new NotFoundException('도면을 찾을 수 없습니다.');
    }

    return drawing;
  }

  async create(
    dto: CreateDrawingDto,
    files: { drawingFile?: Express.Multer.File[]; pdfFile?: Express.Multer.File[] },
  ): Promise<Drawing> {
    // 입력값 trim 처리
    const drawingNumber = dto.drawingNumber.trim();
    const projectName = dto.projectName.trim();
    const versionStr = dto.version.trim();

    const drawingFile = files.drawingFile?.[0];
    const pdfFile = files.pdfFile?.[0];

    // 에러 발생 시 업로드된 파일 삭제 헬퍼
    const cleanupFiles = () => {
      if (drawingFile?.path && existsSync(drawingFile.path)) {
        unlinkSync(drawingFile.path);
      }
      if (pdfFile?.path && existsSync(pdfFile.path)) {
        unlinkSync(pdfFile.path);
      }
    };

    try {
      // 도면 파일 필수 체크
      if (!drawingFile) {
        throw new NotFoundException('도면 파일은 필수입니다.');
      }

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
        drawingNumber,
        description: dto.description?.trim(),
        currentVersion: versionStr,
      });

      const savedDrawing = await this.drawingRepository.save(drawing);

      // 파일 이동
      const { drawingFilePath, pdfFilePath } = await this.moveFilesToDrawingDirectory(
        savedDrawing.id,
        savedDrawing.drawingNumber,
        versionStr,
        dto.description?.trim() || '',
        drawingFile,
        pdfFile,
      );

      const drawingVersion = this.versionRepository.create({
        drawingId: savedDrawing.id,
        version: versionStr,
        drawingFilePath,
        drawingFileName: drawingFile.originalname,
        pdfFilePath,
        pdfFileName: pdfFile?.originalname,
        registrationDate: new Date(dto.registrationDate),
        changeNote: dto.changeNote?.trim(),
      });

      await this.versionRepository.save(drawingVersion);

      return this.findOne(savedDrawing.id);
    } catch (error) {
      cleanupFiles();
      throw error;
    }
  }

  async update(id: number, dto: UpdateDrawingDto): Promise<Drawing> {
    const drawing = await this.findOne(id);

    await this.drawingRepository.update(id, {
      ...dto,
    });

    return this.findOne(id);
  }

  async softDelete(id: number): Promise<void> {
    const drawing = await this.findOne(id);
    await this.drawingRepository.softDelete(id);
  }

  // 버전 관련 메서드
  async findVersionsByDrawingId(drawingId: number): Promise<DrawingVersion[]> {
    await this.findOne(drawingId); // 도면 존재 확인

    return this.versionRepository.find({
      where: { drawingId },
      order: { createdAt: 'DESC' },
    });
  }

  async findVersionById(drawingId: number, versionId: number): Promise<DrawingVersion> {
    await this.findOne(drawingId); // 도면 존재 확인

    const version = await this.versionRepository.findOne({
      where: { id: versionId, drawingId },
    });

    if (!version) {
      throw new NotFoundException('버전을 찾을 수 없습니다.');
    }

    return version;
  }

  async createVersion(
    drawingId: number,
    dto: CreateDrawingVersionDto,
    files: { drawingFile?: Express.Multer.File[]; pdfFile?: Express.Multer.File[] },
  ): Promise<DrawingVersion> {
    const drawing = await this.findOne(drawingId);

    // 도면 파일 필수 체크
    if (!files.drawingFile || files.drawingFile.length === 0) {
      throw new NotFoundException('도면 파일은 필수입니다.');
    }

    const drawingFile = files.drawingFile[0];
    const pdfFile = files.pdfFile?.[0];

    // 파일 이동
    const { drawingFilePath, pdfFilePath } = await this.moveFilesToDrawingDirectory(
      drawingId,
      drawing.drawingNumber,
      dto.version,
      dto.changeNote?.trim() || '',
      drawingFile,
      pdfFile,
    );

    const version = this.versionRepository.create({
      drawingId,
      version: dto.version,
      drawingFilePath,
      drawingFileName: drawingFile.originalname,
      pdfFilePath,
      pdfFileName: pdfFile?.originalname,
      registrationDate: new Date(dto.registrationDate),
      changeNote: dto.changeNote,
    });

    const savedVersion = await this.versionRepository.save(version);

    // Drawing의 currentVersion 업데이트
    await this.drawingRepository.update(drawingId, { currentVersion: dto.version });

    return savedVersion;
  }

  async deleteVersion(drawingId: number, versionId: number): Promise<void> {
    const version = await this.findVersionById(drawingId, versionId);

    // 파일 삭제
    if (version.drawingFilePath && existsSync(version.drawingFilePath)) {
      unlinkSync(version.drawingFilePath);
    }
    if (version.pdfFilePath && existsSync(version.pdfFilePath)) {
      unlinkSync(version.pdfFilePath);
    }

    await this.versionRepository.delete(versionId);

    // 삭제 후 최신 버전 업데이트
    const latestVersion = await this.versionRepository.findOne({
      where: { drawingId },
      order: { createdAt: 'DESC' },
    });

    if (latestVersion) {
      await this.drawingRepository.update(drawingId, { currentVersion: latestVersion.version });
    }
  }

  // 파일 다운로드 경로 조회
  async getVersionFilePath(drawingId: number, versionId: number, fileType: 'drawing' | 'pdf'): Promise<{ filePath: string; fileName: string }> {
    const version = await this.findVersionById(drawingId, versionId);

    if (fileType === 'drawing') {
      if (!version.drawingFilePath || !existsSync(version.drawingFilePath)) {
        throw new NotFoundException('도면 파일을 찾을 수 없습니다.');
      }
      return { filePath: version.drawingFilePath, fileName: version.drawingFileName };
    } else {
      if (!version.pdfFilePath || !existsSync(version.pdfFilePath)) {
        throw new NotFoundException('PDF 파일을 찾을 수 없습니다.');
      }
      return { filePath: version.pdfFilePath, fileName: version.pdfFileName };
    }
  }

  async getLatestVersionFilePath(drawingId: number, fileType: 'drawing' | 'pdf'): Promise<{ filePath: string; fileName: string }> {
    const drawing = await this.findOne(drawingId);

    const latestVersion = await this.versionRepository.findOne({
      where: { drawingId, version: drawing.currentVersion },
    });

    if (!latestVersion) {
      throw new NotFoundException('최신 버전을 찾을 수 없습니다.');
    }

    return this.getVersionFilePath(drawingId, latestVersion.id, fileType);
  }

  // 기존 정적 도면 파일 다운로드 (레거시)
  async getDrawingFilePath(category: string, location: string, floor: string): Promise<string> {
    const drawingPath = join(process.cwd(), 'data', 'drawings');
    const filePath = join(drawingPath, category, location, `${floor}.pdf`);

    if (!existsSync(filePath)) {
      throw new NotFoundException('도면 파일을 찾을 수 없습니다.');
    }

    return filePath;
  }

  // 파일을 도면 전용 디렉토리로 이동
  private async moveFilesToDrawingDirectory(
    drawingId: number,
    drawingNumber: string,
    version: string,
    description: string,
    drawingFile: Express.Multer.File,
    pdfFile?: Express.Multer.File,
  ): Promise<{ drawingFilePath: string; pdfFilePath?: string }> {
    const baseDir = join(process.cwd(), 'data', 'uploads', 'drawings', String(drawingId));

    // 디렉토리 생성
    if (!existsSync(baseDir)) {
      mkdirSync(baseDir, { recursive: true });
    }

    // 파일명 생성: 도면번호_버전_도면내용_timestamp.확장자
    const timestamp = Date.now();
    const sanitizedDescription = description.replace(/[<>:"/\\|?*]/g, '_'); // 파일명에 사용 불가한 문자 제거

    // 도면 파일 이동
    const drawingExt = extname(drawingFile.originalname);
    const drawingFileName = `${drawingNumber}_${version}_${sanitizedDescription}_${timestamp}${drawingExt}`;
    const drawingFilePath = join(baseDir, drawingFileName);
    renameSync(drawingFile.path, drawingFilePath);

    // PDF 파일 이동
    let pdfFilePath: string | undefined;
    if (pdfFile) {
      const pdfExt = extname(pdfFile.originalname);
      const pdfFileName = `${drawingNumber}_${version}_${sanitizedDescription}_${timestamp}${pdfExt}`;
      pdfFilePath = join(baseDir, pdfFileName);
      renameSync(pdfFile.path, pdfFilePath);
    }

    return { drawingFilePath, pdfFilePath };
  }
}
