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

const pdfFileFilter = (_req: any, file: any, cb: (error: Error | null, acceptFile: boolean) => void) => {
  if (file.mimetype !== 'application/pdf') {
    cb(new BadRequestException('Only PDF files are allowed'), false);
    return;
  }
  cb(null, true);
};

export const pdfMulterOptions: MulterOptions = {
  storage,
  fileFilter: pdfFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
};
