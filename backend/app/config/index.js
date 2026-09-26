import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root or backend folder
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  jwtSecret: process.env.JWT_SECRET || 'togethermiles-super-secure-dev-secret-key-2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',
  nodeEnv: process.env.NODE_ENV || 'development',
  dbPath: process.env.DATABASE_PATH || path.resolve(__dirname, '../../../database/togethermiles.db'),
  uploadDir: process.env.UPLOAD_DIR || path.resolve(__dirname, '../../uploads'),
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB limit
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  corsOrigin: process.env.CORS_ORIGIN || '*'
};
