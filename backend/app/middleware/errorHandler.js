import { AppError } from '../utils/errors.js';
import multer from 'multer';

export function errorHandler(err, req, res, next) {
  // If already sent headers, delegate to default express error handler
  if (res.headersSent) {
    return next(err);
  }

  // Handle Multer upload errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Image size exceeds maximum limit of 5MB',
          code: 'FILE_TOO_LARGE'
        }
      });
    }
    return res.status(400).json({
      success: false,
      error: {
        message: 'File upload error: ' + err.message,
        code: 'UPLOAD_ERROR'
      }
    });
  }

  // Handle SQLite / Database constraints
  if (err.message && err.message.includes('FOREIGN KEY constraint failed')) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'The requested operation references an invalid or non-existent entity',
        code: 'CONSTRAINT_ERROR'
      }
    });
  }

  if (err.message && err.message.includes('UNIQUE constraint failed')) {
    return res.status(409).json({
      success: false,
      error: {
        message: 'A record with this information already exists',
        code: 'DUPLICATE_RECORD'
      }
    });
  }

  // Handle custom AppErrors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        details: err.details || null
      }
    });
  }

  // General server errors (never expose stack traces to client)
  console.error('[Unhandled Server Error]:', err);
  return res.status(500).json({
    success: false,
    error: {
      message: 'Something went wrong. Please try again.',
      code: 'INTERNAL_ERROR'
    }
  });
}
