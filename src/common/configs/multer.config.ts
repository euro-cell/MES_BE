import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

function decodeFilename(filename: string) {
  return Buffer.from(filename, 'latin1').toString('utf8');
}

export const multerConfig: MulterOptions = {
  storage: diskStorage({
    destination: (req, file, callback) => {
      callback(null, join(process.cwd(), 'data', 'uploads'));
    },
    filename: (req, file, callback) => {
      const timestamp = Date.now();
      const utf8Name = decodeFilename(file.originalname);
      const ext = extname(utf8Name);
      const baseName = utf8Name.replace(ext, '');
      callback(null, `${timestamp}_${baseName}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
};
