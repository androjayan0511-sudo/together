import { Router } from 'express';
import { loveNoteService } from '../../services/loveNoteService.js';
import { authenticate } from '../../middleware/authMiddleware.js';
import { requireCouple } from '../../middleware/coupleMiddleware.js';

export const loveNoteRouter = Router();

loveNoteRouter.use(authenticate, requireCouple);

// Get all love notes for couple space (locked notes have content hidden)
loveNoteRouter.get('/', async (req, res, next) => {
  try {
    const notes = await loveNoteService.getNotes(req.coupleId, req.user.id);
    res.json({
      success: true,
      data: notes
    });
  } catch (err) {
    next(err);
  }
});

// Create new love note
loveNoteRouter.post('/', async (req, res, next) => {
  try {
    const { title, content, unlockAt } = req.body;
    const note = await loveNoteService.createNote(
      req.coupleId,
      req.user.id,
      req.partnerId,
      { title, content, unlockAt }
    );
    res.status(201).json({
      success: true,
      message: 'Love note sealed and sent to your partner',
      data: note
    });
  } catch (err) {
    next(err);
  }
});

// View single love note (enforces unlock check)
loveNoteRouter.get('/:id', async (req, res, next) => {
  try {
    const note = await loveNoteService.getNoteById(req.coupleId, req.params.id, req.user.id);
    res.json({
      success: true,
      data: note
    });
  } catch (err) {
    next(err);
  }
});

// Delete love note (author only)
loveNoteRouter.delete('/:id', async (req, res, next) => {
  try {
    await loveNoteService.deleteNote(req.coupleId, req.params.id, req.user.id);
    res.json({
      success: true,
      message: 'Love note deleted'
    });
  } catch (err) {
    next(err);
  }
});
