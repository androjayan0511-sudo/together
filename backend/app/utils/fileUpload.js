import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { config } from '../config/index.js';
import { ValidationError } from './errors.js';

// Ensure upload directory exists
if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate secure random filename with safe extension
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext) ? ext : '.jpg';
    const randomName = `${crypto.randomUUID()}${safeExt}`;
    cb(null, randomName);
  }
});

const fileFilter = (req, file, cb) => {
  if (config.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ValidationError('Only JPG, PNG, WEBP, and GIF images are allowed'), false);
  }
};

export const uploadMemoryImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.maxFileSize
  }
});
