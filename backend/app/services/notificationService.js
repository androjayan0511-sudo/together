import { notificationRepository } from '../repositories/notificationRepository.js';

export const notificationService = {
  async getNotifications(userId, limit = 30) {
    const list = notificationRepository.findByUserId(userId, limit);
    const unreadCount = notificationRepository.getUnreadCount(userId);
    return { list, unreadCount };
  },

  async markAsRead(notificationId, userId) {
    const now = new Date().toISOString();
    return notificationRepository.markAsRead(notificationId, userId, now);
  },

  async markAllAsRead(userId) {
    const now = new Date().toISOString();
    return notificationRepository.markAllAsRead(userId, now);
  }
};
