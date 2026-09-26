import { Router } from 'express';
import { activityService } from '../../services/activityService.js';
import { authenticate } from '../../middleware/authMiddleware.js';

export const activityRouter = Router();

activityRouter.use(authenticate);

// Get all curated activities
activityRouter.get('/', async (req, res, next) => {
  try {
    const activities = await activityService.getActivities();
    res.json({
      success: true,
      data: activities
    });
  } catch (err) {
    next(err);
  }
});
