/**
 * 기존 PDF 파일들을 WebP 이미지로 변환하는 마이그레이션 스크립트
 *
 * 실행 방법:
 * npx ts-node scripts/migrate-pdf-to-images.ts
 */

import { DataSource } from 'typeorm';
import { join } from 'path';
import { existsSync } from 'fs';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { convertPdfToImages } from '../src/common/utils/pdf-converter.util';
import { DrawingVersion } from '../src/common/entities/drawing-version.entity';
import { Drawing } from '../src/common/entities/drawing.entity';
import * as dotenv from 'dotenv';

dotenv.config();

async function migrate() {
  console.log('PDF → WebP 이미지 변환 마이그레이션 시작...\n');

  // 데이터베이스 연결 (typeorm.config.ts와 동일한 설정 사용)
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: [Drawing, DrawingVersion],
    synchronize: false,
    namingStrategy: new SnakeNamingStrategy(),
  });

  await dataSource.initialize();
  console.log('데이터베이스 연결 완료\n');

  const versionRepository = dataSource.getRepository(DrawingVersion);

  // PDF가 있지만 이미지가 없는 버전들 조회
  const versions = await versionRepository
    .createQueryBuilder('version')
    .leftJoinAndSelect('version.drawing', 'drawing')
    .where('version.pdf_file_paths IS NOT NULL')
    .andWhere("version.pdf_file_paths::text != '[]'")
    .andWhere("(version.image_file_paths IS NULL OR version.image_file_paths::text = '[]')")
    .getMany();

  console.log(`변환 대상 버전 수: ${versions.length}\n`);

  let successCount = 0;
  let failCount = 0;

  for (const version of versions) {
    const drawingId = version.drawing?.id;
    if (!drawingId || !version.pdfFilePaths || version.pdfFilePaths.length === 0) {
      continue;
    }

    console.log(`처리 중: 도면 ${drawingId}, 버전 ${version.id}`);

    const allImagePaths: string[] = [];

    for (let pdfIndex = 0; pdfIndex < version.pdfFilePaths.length; pdfIndex++) {
      const pdfRelativePath = version.pdfFilePaths[pdfIndex];
      const pdfAbsolutePath = join(process.cwd(), pdfRelativePath);

      if (!existsSync(pdfAbsolutePath)) {
        console.log(`  ⚠️ PDF 파일 없음: ${pdfRelativePath}`);
        continue;
      }

      // 이미지 출력 디렉토리
      const imageRelativeDir = join('data', 'uploads', 'drawings', String(drawingId), 'images', `pdf-${pdfIndex + 1}`);
      const imageAbsoluteDir = join(process.cwd(), imageRelativeDir);

      try {
        const imagePaths = await convertPdfToImages(pdfAbsolutePath, imageAbsoluteDir, {
          scale: 2048,
          format: 'png',
        });

        // 상대 경로로 변환
        const relativeImagePaths = imagePaths.map((absPath) => {
          return absPath.replace(process.cwd(), '').replace(/^[\\/]/, '');
        });

        allImagePaths.push(...relativeImagePaths);
        console.log(`  ✅ PDF ${pdfIndex + 1} 변환 완료: ${relativeImagePaths.length}페이지`);
      } catch (err) {
        console.log(`  ❌ PDF ${pdfIndex + 1} 변환 실패: ${err.message}`);
      }
    }

    // DB 업데이트
    if (allImagePaths.length > 0) {
      await versionRepository.update(version.id, {
        imageFilePaths: allImagePaths,
      });
      console.log(`  💾 DB 저장 완료: ${allImagePaths.length}개 이미지\n`);
      successCount++;
    } else {
      console.log(`  ⚠️ 변환된 이미지 없음\n`);
      failCount++;
    }
  }

  await dataSource.destroy();

  console.log('\n========================================');
  console.log(`마이그레이션 완료!`);
  console.log(`성공: ${successCount}개`);
  console.log(`실패: ${failCount}개`);
  console.log('========================================');
}

migrate().catch((err) => {
  console.error('마이그레이션 실패:', err);
  process.exit(1);
});
