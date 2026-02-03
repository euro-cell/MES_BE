import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

interface ConvertOptions {
  scale?: number; // 최대 너비/높이 (픽셀), 기본값: 2048
  format?: 'png' | 'jpeg'; // 출력 포맷, 기본값: 'png'
}

/**
 * PDF 파일을 이미지로 변환 (pdftoppm 사용 - Linux/Windows 모두 지원)
 * @param pdfPath PDF 파일 경로
 * @param outputDir 출력 디렉토리 경로
 * @param options 변환 옵션
 * @returns 생성된 이미지 파일 경로 배열
 *
 * 시스템 요구사항:
 * - Windows: Poppler 설치 후 bin 폴더를 PATH에 추가
 *   https://github.com/oschwartz10612/poppler-windows/releases
 * - Linux: sudo apt-get install poppler-utils (또는 apk add poppler-utils)
 * - macOS: brew install poppler
 */
export async function convertPdfToImages(
  pdfPath: string,
  outputDir: string,
  options: ConvertOptions = {},
): Promise<string[]> {
  const { scale = 2048, format = 'png' } = options;

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const baseName = 'page';
  const outputPrefix = path.join(outputDir, baseName);

  // pdftoppm 명령어 구성
  // -png 또는 -jpeg: 출력 포맷
  // -scale-to: 최대 크기 (가로/세로 중 큰 쪽 기준)
  const formatFlag = format === 'jpeg' ? '-jpeg' : '-png';
  const command = `pdftoppm ${formatFlag} -scale-to ${scale} "${pdfPath}" "${outputPrefix}"`;

  await execAsync(command);

  // 변환된 이미지 파일 목록 조회
  // pdftoppm은 파일명-1.png, 파일명-2.png 형식으로 생성
  const ext = format === 'jpeg' ? 'jpg' : 'png';
  const files = fs.readdirSync(outputDir);
  const imageFiles = files
    .filter((file) => file.startsWith(baseName) && (file.endsWith(`.${ext}`) || file.endsWith(`.${format}`)))
    .sort((a, b) => {
      // page-1.png, page-2.png 순서로 정렬
      const numA = parseInt(a.match(/(\d+)/)?.[1] || '0');
      const numB = parseInt(b.match(/(\d+)/)?.[1] || '0');
      return numA - numB;
    })
    .map((file) => path.join(outputDir, file));

  return imageFiles;
}

/**
 * 여러 PDF 파일을 이미지로 변환
 * @param pdfPaths PDF 파일 경로 배열
 * @param baseOutputDir 기본 출력 디렉토리
 * @param options 변환 옵션
 * @returns PDF별 이미지 경로 배열의 맵
 */
export async function convertMultiplePdfsToImages(
  pdfPaths: string[],
  baseOutputDir: string,
  options: ConvertOptions = {},
): Promise<Map<string, string[]>> {
  const results = new Map<string, string[]>();

  for (let idx = 0; idx < pdfPaths.length; idx++) {
    const pdfPath = pdfPaths[idx];
    const outputDir = path.join(baseOutputDir, `pdf-${idx + 1}`);
    const imagePaths = await convertPdfToImages(pdfPath, outputDir, options);
    results.set(pdfPath, imagePaths);
  }

  return results;
}
