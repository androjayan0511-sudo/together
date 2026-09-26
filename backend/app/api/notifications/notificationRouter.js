import { Router } from 'express';
import { notificationService } from '../../services/notificationService.js';
import { authenticate } from '../../middleware/authMiddleware.js';

export const notificationRouter = Router();

notificationRouter.use(authenticate);

// Get user notifications
notificationRouter.get('/', async (req, res, next) => {
  try {
    const data = await notificationService.getNotifications(req.user.id);
    res.json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
});

// Mark single notification as read
notificationRouter.patch('/:id/read', async (req, res, next) => {
  try {
    await notificationService.markAsRead(req.params.id, req.user.id);
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (err) {
    next(err);
  }
});

// Mark all notifications as read
notificationRouter.patch('/read-all', async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (err) {
    next(err);
  }
});
