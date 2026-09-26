import { Router } from 'express';
import { coupleService } from '../../services/coupleService.js';
import { authenticate } from '../../middleware/authMiddleware.js';
import { requireCouple } from '../../middleware/coupleMiddleware.js';

export const coupleRouter = Router();

// Create new couple space (generates unique pairing code)
coupleRouter.post('/', authenticate, async (req, res, next) => {
  try {
    const { relationshipStartDate } = req.body;
    const couple = await coupleService.createCouple(req.user.id, { relationshipStartDate });
    res.status(201).json({
      success: true,
      message: 'Couple space created. Share your pairing code with your partner.',
      data: couple
    });
  } catch (err) {
    next(err);
  }
});

// Join existing couple space using pairing code
coupleRouter.post('/join', authenticate, async (req, res, next) => {
  try {
    const { pairingCode } = req.body;
    const couple = await coupleService.joinCouple(req.user.id, pairingCode);
    res.json({
      success: true,
      message: 'Successfully paired! Welcome to your shared space.',
      data: couple
    });
  } catch (err) {
    next(err);
  }
});

// Get current couple space information
coupleRouter.get('/me', authenticate, async (req, res, next) => {
  try {
    const couple = await coupleService.getCoupleInfo(req.user.id);
    res.json({
      success: true,
      data: couple
    });
  } catch (err) {
    next(err);
  }
});

// Update relationship start date
coupleRouter.patch('/me/date', authenticate, requireCouple, async (req, res, next) => {
  try {
    const { relationshipStartDate } = req.body;
    const updated = await coupleService.updateStartDate(req.user.id, req.coupleId, relationshipStartDate);
    res.json({
      success: true,
      message: 'Relationship start date updated',
      data: updated
    });
  } catch (err) {
    next(err);
  }
});

// Leave/disconnect couple space
coupleRouter.post('/me/leave', authenticate, requireCouple, async (req, res, next) => {
  try {
    await coupleService.leaveCouple(req.user.id, req.coupleId);
    res.json({
      success: true,
      message: 'Disconnected from couple space'
    });
  } catch (err) {
    next(err);
  }
});
