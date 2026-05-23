import { diskStorage } from 'multer';
import * as crypto from 'crypto';
import * as path from 'path';
import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

const storage = diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, './uploads');
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = crypto.randomBytes(16).toString('hex') + ext;
    cb(null, name);
  },
});

const imageFileFilter = (_req: any, file: any, cb: (error: Error | null, acceptFile: boolean) => void) => {
  if (!file.mimetype.startsWith('image/')) {
    cb(new BadRequestException('Only image files are allowed'), false);
    return;
  }
  cb(null, true);
};

export const multerOptions: MulterOptions = {
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
};
