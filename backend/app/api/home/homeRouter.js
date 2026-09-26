import { Router } from 'express';
import { coupleService } from '../../services/coupleService.js';
import { checkInService } from '../../services/checkInService.js';
import { meetingService } from '../../services/meetingService.js';
import { importantDateService } from '../../services/importantDateService.js';
import { memoryService } from '../../services/memoryService.js';
import { chatService } from '../../services/chatService.js';
import { authenticate } from '../../middleware/authMiddleware.js';
import { requireCouple } from '../../middleware/coupleMiddleware.js';

export const homeRouter = Router();

homeRouter.use(authenticate, requireCouple);

// Comprehensive home summary endpoint answering:
// 1. How are we doing today? (check-ins)
// 2. What is happening next? (upcoming date)
// 3. What memories have we created? (recent memory)
// 4. When are we meeting? (next meeting countdown)
homeRouter.get('/summary', async (req, res, next) => {
  try {
    const coupleId = req.coupleId;
    const userId = req.user.id;

    const [
      coupleInfo,
      todayCheckIns,
      nextMeeting,
      upcomingDate,
      recentMemory,
      unreadChatCount
    ] = await Promise.all([
      coupleService.getCoupleInfo(userId),
      checkInService.getLatestForCouple(coupleId),
      meetingService.getNextMeeting(coupleId),
      importantDateService.getUpcomingDate(coupleId),
      memoryService.getRecentMemory(coupleId),
      chatService.getUnreadCount(coupleId, userId)
    ]);

    res.json({
      success: true,
      data: {
        couple: coupleInfo,
        partner: req.partner,
        todayCheckIns,
        nextMeeting,
        upcomingDate,
        recentMemory,
        unreadChatCount
      }
    });
  } catch (err) {
    next(err);
  }
});
