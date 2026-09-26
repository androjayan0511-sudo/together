import { messageRepository } from '../repositories/messageRepository.js';
import { generateId } from '../utils/crypto.js';
import { ValidationError } from '../utils/errors.js';
import { wsManager } from '../websocket/wsManager.js';

export const chatService = {
  async getMessages(coupleId, { limit = 50, before = null } = {}) {
    return messageRepository.findByCoupleId(coupleId, { limit, before });
  },

  async sendMessage(coupleId, senderId, { content, messageType = 'text' }) {
    if (!content || content.trim().length === 0) {
      throw new ValidationError('Message content cannot be empty');
    }

    const id = generateId('msg');
    const now = new Date().toISOString();

    const message = messageRepository.create({
      id,
      coupleId,
      senderId,
      content: content.trim(),
      messageType,
      createdAt: now
    });

    // Broadcast to partner in real-time via WebSocket
    wsManager.broadcastToCouple(coupleId, {
      type: 'NEW_MESSAGE',
      payload: message
    }, senderId);

    return message;
  },

  async markAsRead(coupleId, currentUserId) {
    const now = new Date().toISOString();
    const count = messageRepository.markAsRead(coupleId, currentUserId, now);

    if (count > 0) {
      // Notify partner that messages have been read
      wsManager.broadcastToCouple(coupleId, {
        type: 'MESSAGES_READ',
        payload: {
          readBy: currentUserId,
          readAt: now
        }
      }, currentUserId);
    }

    return { readCount: count, readAt: now };
  },

  async getUnreadCount(coupleId, currentUserId) {
    return messageRepository.getUnreadCount(coupleId, currentUserId);
  }
};
