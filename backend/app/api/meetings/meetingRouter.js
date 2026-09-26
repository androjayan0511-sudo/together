import { Router } from 'express';
import { meetingService } from '../../services/meetingService.js';
import { authenticate } from '../../middleware/authMiddleware.js';
import { requireCouple } from '../../middleware/coupleMiddleware.js';

export const meetingRouter = Router();

meetingRouter.use(authenticate, requireCouple);

// Get next upcoming meeting
meetingRouter.get('/next', async (req, res, next) => {
  try {
    const meeting = await meetingService.getNextMeeting(req.coupleId);
    res.json({
      success: true,
      data: meeting
    });
  } catch (err) {
    next(err);
  }
});

// Get all meetings history
meetingRouter.get('/', async (req, res, next) => {
  try {
    const meetings = await meetingService.getAllMeetings(req.coupleId);
    res.json({
      success: true,
      data: meetings
    });
  } catch (err) {
    next(err);
  }
});

// Create new meeting
meetingRouter.post('/', async (req, res, next) => {
  try {
    const { title, meetingAt, location, note } = req.body;
    const meeting = await meetingService.createMeeting(req.coupleId, {
      title,
      meetingAt,
      location,
      note
    });
    res.status(201).json({
      success: true,
      message: 'Next meeting planned!',
      data: meeting
    });
  } catch (err) {
    next(err);
  }
});

// Update meeting
meetingRouter.patch('/:id', async (req, res, next) => {
  try {
    const { title, meetingAt, location, note } = req.body;
    const updated = await meetingService.updateMeeting(req.coupleId, req.params.id, {
      title,
      meetingAt,
      location,
      note
    });
    res.json({
      success: true,
      message: 'Meeting details updated',
      data: updated
    });
  } catch (err) {
    next(err);
  }
});

// Delete meeting
meetingRouter.delete('/:id', async (req, res, next) => {
  try {
    await meetingService.deleteMeeting(req.coupleId, req.params.id);
    res.json({
      success: true,
      message: 'Meeting removed'
    });
  } catch (err) {
    next(err);
  }
});
