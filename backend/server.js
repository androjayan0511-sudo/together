import http from 'node:http';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { config } from './app/config/index.js';
import { db } from './app/config/db.js';
import { wsManager } from './app/websocket/wsManager.js';
import { errorHandler } from './app/middleware/errorHandler.js';

// Routers
import { authRouter } from './app/api/auth/authRouter.js';
import { coupleRouter } from './app/api/couples/coupleRouter.js';
import { messageRouter } from './app/api/messages/messageRouter.js';
import { checkInRouter } from './app/api/checkins/checkInRouter.js';
import { memoryRouter } from './app/api/memories/memoryRouter.js';
import { loveNoteRouter } from './app/api/notes/loveNoteRouter.js';
import { importantDateRouter } from './app/api/dates/importantDateRouter.js';
import { meetingRouter } from './app/api/meetings/meetingRouter.js';
import { journalRouter } from './app/api/journal/journalRouter.js';
import { activityRouter } from './app/api/activities/activityRouter.js';
import { notificationRouter } from './app/api/notifications/notificationRouter.js';
import { homeRouter } from './app/api/home/homeRouter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// CORS configuration
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads serving with security headers
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cache-Control', 'public, max-age=31536000');
  next();
}, express.static(config.uploadDir));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    product: 'TogetherMiles',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/couples', coupleRouter);
app.use('/api/messages', messageRouter);
app.use('/api/checkins', checkInRouter);
app.use('/api/memories', memoryRouter);
app.use('/api/love-notes', loveNoteRouter);
app.use('/api/dates', importantDateRouter);
app.use('/api/meetings', meetingRouter);
app.use('/api/journal', journalRouter);
app.use('/api/activities', activityRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/home', homeRouter);

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `API route ${req.method} ${req.originalUrl} not found`,
      code: 'ROUTE_NOT_FOUND'
    }
  });
});

// Centralized error handling
app.use(errorHandler);

// Initialize WebSocket Manager on the HTTP server
wsManager.init(server);

// If run directly
if (process.env.NODE_ENV !== 'test') {
  server.listen(config.port, () => {
    console.log(`[TogetherMiles Backend] running on http://localhost:${config.port}`);
    console.log(`[TogetherMiles WS] WebSocket ready at ws://localhost:${config.port}/ws`);
  });
}

export { app, server };
