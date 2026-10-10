import { Request, Response, NextFunction } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { envConfig } from '../../../config/env.config.js';
import { BadRequestError } from '../../../core/errors/app-error.js';

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// Allowed extensions
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];

// Use memory storage for direct processing in memory without disk I/O
const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  const fileExt = path.extname(file.originalname).toLowerCase();

  const isMimeValid = ALLOWED_MIME_TYPES.includes(file.mimetype);
  const isExtValid = ALLOWED_EXTENSIONS.includes(fileExt);

  if (!isMimeValid || !isExtValid) {
    return cb(
      new BadRequestError(
        `Invalid file type '${fileExt}'. Only PDF, DOC, and DOCX documents are allowed.`
      )
    );
  }

  cb(null, true);
};

const maxSizeBytes = envConfig.MAX_FILE_SIZE_MB * 1024 * 1024;

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxSizeBytes,
    files: 1,
  },
});

/**
 * Middleware that intercepts and validates a single resume file from form-data (field: 'resume' or 'file')
 */
export const resumeUploadMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const uploadSingle = upload.single('resume');

  uploadSingle(req, res, (err: unknown) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(
            new BadRequestError(
              `File size exceeds the maximum allowed limit of ${envConfig.MAX_FILE_SIZE_MB}MB.`
            )
          );
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return next(
            new BadRequestError(
              `Unexpected field '${err.field}'. Please upload the document using the form field 'resume'.`
            )
          );
        }
        return next(new BadRequestError(`File upload error: ${err.message}`));
      }

      if (err instanceof Error) {
        return next(err);
      }

      return next(new BadRequestError('An unknown error occurred during file upload.'));
    }

    if (!req.file) {
      return next(
        new BadRequestError('No resume file was uploaded. Please attach a PDF, DOC, or DOCX file.')
      );
    }

    if (!req.file.buffer || req.file.buffer.length === 0) {
      return next(new BadRequestError('Uploaded file is empty (0 bytes).'));
    }

    next();
  });
};
