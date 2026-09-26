import { Router } from 'express';
import { journalService } from '../../services/journalService.js';
import { authenticate } from '../../middleware/authMiddleware.js';
import { requireCouple } from '../../middleware/coupleMiddleware.js';

export const journalRouter = Router();

journalRouter.use(authenticate, requireCouple);

// Get journal entries
journalRouter.get('/', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit || '50', 10);
    const offset = parseInt(req.query.offset || '0', 10);
    const entries = await journalService.getEntries(req.coupleId, { limit, offset });
    res.json({
      success: true,
      data: entries
    });
  } catch (err) {
    next(err);
  }
});

// Create new journal entry
journalRouter.post('/', async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const entry = await journalService.createEntry(req.coupleId, req.user.id, { title, content });
    res.status(201).json({
      success: true,
      message: 'Journal entry saved',
      data: entry
    });
  } catch (err) {
    next(err);
  }
});

// Get single journal entry
journalRouter.get('/:id', async (req, res, next) => {
  try {
    const entry = await journalService.getEntryById(req.coupleId, req.params.id);
    res.json({
      success: true,
      data: entry
    });
  } catch (err) {
    next(err);
  }
});

// Update journal entry (author only)
journalRouter.patch('/:id', async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const updated = await journalService.updateEntry(req.coupleId, req.params.id, req.user.id, { title, content });
    res.json({
      success: true,
      message: 'Journal entry updated',
      data: updated
    });
  } catch (err) {
    next(err);
  }
});

// Delete journal entry (author only)
journalRouter.delete('/:id', async (req, res, next) => {
  try {
    await journalService.deleteEntry(req.coupleId, req.params.id, req.user.id);
    res.json({
      success: true,
      message: 'Journal entry removed'
    });
  } catch (err) {
    next(err);
  }
});
