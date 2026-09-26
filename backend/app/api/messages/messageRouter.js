import { Router } from 'express';
import { chatService } from '../../services/chatService.js';
import { authenticate } from '../../middleware/authMiddleware.js';
import { requireCouple } from '../../middleware/coupleMiddleware.js';

export const messageRouter = Router();

messageRouter.use(authenticate, requireCouple);

// Get message history
messageRouter.get('/', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit || '50', 10);
    const before = req.query.before || null;
    const messages = await chatService.getMessages(req.coupleId, { limit, before });
    res.json({
      success: true,
      data: messages
    });
  } catch (err) {
    next(err);
  }
});

// Send new message
messageRouter.post('/', async (req, res, next) => {
  try {
    const { content, messageType = 'text' } = req.body;
    const message = await chatService.sendMessage(req.coupleId, req.user.id, { content, messageType });
    res.status(201).json({
      success: true,
      data: message
    });
  } catch (err) {
    next(err);
  }
});

// Mark partner's messages as read
messageRouter.patch('/read', async (req, res, next) => {
  try {
    const result = await chatService.markAsRead(req.coupleId, req.user.id);
    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
});

// Get unread count
messageRouter.get('/unread-count', async (req, res, next) => {
  try {
    const count = await chatService.getUnreadCount(req.coupleId, req.user.id);
    res.json({
      success: true,
      data: { count }
    });
  } catch (err) {
    next(err);
  }
});
