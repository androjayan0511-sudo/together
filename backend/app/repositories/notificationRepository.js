import { db } from '../config/db.js';

export const notificationRepository = {
  create({ id, userId, type, title, body, createdAt }) {
    const stmt = db.prepare(`
      INSERT INTO notifications (id, user_id, type, title, body, read_at, created_at)
      VALUES (?, ?, ?, ?, ?, NULL, ?)
    `);
    stmt.run(id, userId, type, title, body, createdAt);
    return this.findById(id);
  },

  findById(id) {
    const stmt = db.prepare(`SELECT * FROM notifications WHERE id = ?`);
    return stmt.get(id) || null;
  },

  findByUserId(userId, limit = 20) {
    const stmt = db.prepare(`
      SELECT * FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `);
    return stmt.all(userId, limit);
  },

  markAsRead(id, userId, readAt) {
    const stmt = db.prepare(`
      UPDATE notifications
      SET read_at = ?
      WHERE id = ? AND user_id = ?
    `);
    stmt.run(readAt, id, userId);
    return this.findById(id);
  },

  markAllAsRead(userId, readAt) {
    const stmt = db.prepare(`
      UPDATE notifications
      SET read_at = ?
      WHERE user_id = ? AND read_at IS NULL
    `);
    const result = stmt.run(readAt, userId);
    return result.changes;
  },

  getUnreadCount(userId) {
    const stmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM notifications
      WHERE user_id = ? AND read_at IS NULL
    `);
    const row = stmt.get(userId);
    return row ? row.count : 0;
  }
};
