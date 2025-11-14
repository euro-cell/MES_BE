import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerConfig: MulterOptions = {
  storage: diskStorage({
    destination: (req, file, callback) => {
      callback(null, 'D:/MES/uploads');
    },
    filename: (req, file, callback) => {
      const timestamp = Date.now();
      const random = Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);

      callback(null, `${timestamp}-${random}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
};
