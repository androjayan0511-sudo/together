import { Router } from 'express';
import { checkInService } from '../../services/checkInService.js';
import { authenticate } from '../../middleware/authMiddleware.js';
import { requireCouple } from '../../middleware/coupleMiddleware.js';

export const checkInRouter = Router();

checkInRouter.use(authenticate, requireCouple);

// Get latest check-in for both partners
checkInRouter.get('/', async (req, res, next) => {
  try {
    const checkIns = await checkInService.getLatestForCouple(req.coupleId);
    res.json({
      success: true,
      data: checkIns
    });
  } catch (err) {
    next(err);
  }
});

// Submit a new daily check-in
checkInRouter.post('/', async (req, res, next) => {
  try {
    const { mood, note } = req.body;
    const checkIn = await checkInService.createCheckIn(
      req.coupleId,
      req.user.id,
      { mood, note },
      req.partnerId
    );
    res.status(201).json({
      success: true,
      message: 'Check-in saved',
      data: checkIn
    });
  } catch (err) {
    next(err);
  }
});

// Get check-in history
checkInRouter.get('/history', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit || '20', 10);
    const history = await checkInService.getHistory(req.coupleId, limit);
    res.json({
      success: true,
      data: history
    });
  } catch (err) {
    next(err);
  }
});
