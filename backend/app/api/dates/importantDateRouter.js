import { Router } from 'express';
import { importantDateService } from '../../services/importantDateService.js';
import { authenticate } from '../../middleware/authMiddleware.js';
import { requireCouple } from '../../middleware/coupleMiddleware.js';

export const importantDateRouter = Router();

importantDateRouter.use(authenticate, requireCouple);

// Get all important dates
importantDateRouter.get('/', async (req, res, next) => {
  try {
    const dates = await importantDateService.getDates(req.coupleId);
    res.json({
      success: true,
      data: dates
    });
  } catch (err) {
    next(err);
  }
});

// Create new important date
importantDateRouter.post('/', async (req, res, next) => {
  try {
    const { title, date, type, reminderEnabled } = req.body;
    const newDate = await importantDateService.createDate(req.coupleId, {
      title,
      date,
      type,
      reminderEnabled
    });
    res.status(201).json({
      success: true,
      message: 'Date added',
      data: newDate
    });
  } catch (err) {
    next(err);
  }
});

// Update date
importantDateRouter.patch('/:id', async (req, res, next) => {
  try {
    const { title, date, type, reminderEnabled } = req.body;
    const updated = await importantDateService.updateDate(req.coupleId, req.params.id, {
      title,
      date,
      type,
      reminderEnabled
    });
    res.json({
      success: true,
      message: 'Date updated',
      data: updated
    });
  } catch (err) {
    next(err);
  }
});

// Delete date
importantDateRouter.delete('/:id', async (req, res, next) => {
  try {
    await importantDateService.deleteDate(req.coupleId, req.params.id);
    res.json({
      success: true,
      message: 'Date removed'
    });
  } catch (err) {
    next(err);
  }
});
