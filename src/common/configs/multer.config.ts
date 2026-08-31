import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { BadRequestException } from '@nestjs/common';
import { memoryStorage } from 'multer';
import { extname } from 'path';

const ALLOWED_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.hwp',
  '.hwpx',
  '.csv',
  '.txt',
  '.zip',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.bmp',
  '.dwg',
  '.dxf',
];

export const multerConfig: MulterOptions = {
  storage: memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    // multipart/form-data 파일명은 Multer/busboy가 Latin-1로 디코딩하기 때문에
    // 브라우저가 UTF-8로 보낸 한글 파일명이 깨진다. Latin-1로 잘못 해석된 바이트를
    // 원래 UTF-8 바이트로 되돌려 재디코딩한다. fileFilter는 저장 전에 호출되므로
    // 이후 file.originalname을 쓰는 모든 업로드 경로에 일괄 적용된다.
    const decoded = Buffer.from(file.originalname, 'latin1').toString('utf-8');
    if (!decoded.includes('�')) {
      file.originalname = decoded;
    }

    const ext = extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      callback(new BadRequestException(`허용되지 않는 파일 형식입니다: ${ext}`), false);
      return;
    }
    callback(null, true);
  },
};
