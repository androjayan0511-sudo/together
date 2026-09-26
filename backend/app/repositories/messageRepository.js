import { db } from '../config/db.js';

export const messageRepository = {
  create({ id, coupleId, senderId, content, messageType = 'text', createdAt }) {
    const stmt = db.prepare(`
      INSERT INTO messages (id, couple_id, sender_id, content, message_type, created_at, read_at)
      VALUES (?, ?, ?, ?, ?, ?, NULL)
    `);
    stmt.run(id, coupleId, senderId, content, messageType, createdAt);
    return this.findById(id);
  },

  findById(id) {
    const stmt = db.prepare(`
      SELECT m.id, m.couple_id, m.sender_id, m.content, m.message_type, m.created_at, m.read_at,
             u.name as sender_name, u.avatar_url as sender_avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.id = ?
    `);
    return stmt.get(id) || null;
  },

  findByCoupleId(coupleId, { limit = 50, before = null } = {}) {
    let sql = `
      SELECT m.id, m.couple_id, m.sender_id, m.content, m.message_type, m.created_at, m.read_at,
             u.name as sender_name, u.avatar_url as sender_avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.couple_id = ?
    `;
    const params = [coupleId];

    if (before) {
      sql += ` AND m.created_at < ?`;
      params.push(before);
    }

    sql += ` ORDER BY m.created_at ASC LIMIT ?`;
    params.push(limit);

    return db.prepare(sql).all(...params);
  },

  markAsRead(coupleId, currentUserId, readAt) {
    // Mark messages sent by partner as read
    const stmt = db.prepare(`
      UPDATE messages
      SET read_at = ?
      WHERE couple_id = ? AND sender_id != ? AND read_at IS NULL
    `);
    const result = stmt.run(readAt, coupleId, currentUserId);
    return result.changes;
  },

  getUnreadCount(coupleId, currentUserId) {
    const stmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM messages
      WHERE couple_id = ? AND sender_id != ? AND read_at IS NULL
    `);
    const row = stmt.get(coupleId, currentUserId);
    return row ? row.count : 0;
  }
};
