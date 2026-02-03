import * as pdfPoppler from 'pdf-poppler';
import * as fs from 'fs';
import * as path from 'path';

interface ConvertOptions {
  scale?: number; // 최대 너비/높이 (픽셀), 기본값: 2048
  format?: 'png' | 'jpeg' | 'webp'; // 출력 포맷, 기본값: 'webp'
}

/**
 * PDF 파일을 이미지로 변환 (pdf-poppler 사용)
 * @param pdfPath PDF 파일 경로
 * @param outputDir 출력 디렉토리 경로
 * @param options 변환 옵션
 * @returns 생성된 이미지 파일 경로 배열
 *
 * 시스템 요구사항:
 * - Windows: Poppler 설치 후 bin 폴더를 PATH에 추가
 *   https://github.com/oschwartz10612/poppler-windows/releases
 * - Linux: sudo apt-get install poppler-utils
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

  const opts: pdfPoppler.Options = {
    format: format,
    out_dir: outputDir,
    out_prefix: baseName,
    scale: scale,
  };

  await pdfPoppler.convert(pdfPath, opts);

  // 변환된 이미지 파일 목록 조회
  // pdf-poppler는 파일명-1.png, 파일명-2.png 형식으로 생성
  const files = fs.readdirSync(outputDir);
  const imageFiles = files
    .filter((file) => file.startsWith(baseName) && file.endsWith(`.${format}`))
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
