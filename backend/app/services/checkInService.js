import { checkInRepository } from '../repositories/checkInRepository.js';
import { notificationRepository } from '../repositories/notificationRepository.js';
import { generateId } from '../utils/crypto.js';
import { ValidationError } from '../utils/errors.js';
import { wsManager } from '../websocket/wsManager.js';

const ALLOWED_MOODS = [
  'Happy',
  'Missing you',
  'Tired',
  'Busy',
  'Sad',
  'Need some time',
  'Want to talk'
];

export const checkInService = {
  async createCheckIn(coupleId, userId, { mood, note = null }, partnerId = null) {
    if (!mood || !ALLOWED_MOODS.includes(mood)) {
      throw new ValidationError(`Invalid mood. Must be one of: ${ALLOWED_MOODS.join(', ')}`);
    }

    const id = generateId('chk');
    const now = new Date().toISOString();

    const checkIn = checkInRepository.create({
      id,
      coupleId,
      userId,
      mood,
      note: note ? note.trim() : null,
      createdAt: now
    });

    // Notify partner in real-time
    wsManager.broadcastToCouple(coupleId, {
      type: 'PARTNER_CHECK_IN',
      payload: checkIn
    }, userId);

    if (partnerId) {
      notificationRepository.create({
        id: generateId('ntf'),
        userId: partnerId,
        type: 'check_in',
        title: 'Partner Check-in',
        body: `Your partner checked in feeling "${mood}"`,
        createdAt: now
      });
    }

    return checkIn;
  },

  async getLatestForCouple(coupleId) {
    return checkInRepository.getLatestForCouple(coupleId);
  },

  async getHistory(coupleId, limit = 20) {
    return checkInRepository.getHistory(coupleId, limit);
  }
};
