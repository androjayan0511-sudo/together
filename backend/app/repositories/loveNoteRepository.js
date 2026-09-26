import { db } from '../config/db.js';

export const loveNoteRepository = {
  create({ id, coupleId, senderId, recipientId, title, content, unlockAt = null, createdAt }) {
    const stmt = db.prepare(`
      INSERT INTO love_notes (id, couple_id, sender_id, recipient_id, title, content, unlock_at, opened_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?)
    `);
    stmt.run(id, coupleId, senderId, recipientId, title, content, unlockAt, createdAt);
    return this.findById(id, coupleId);
  },

  findById(id, coupleId) {
    const stmt = db.prepare(`
      SELECT n.id, n.couple_id, n.sender_id, n.recipient_id, n.title, n.content, n.unlock_at, n.opened_at, n.created_at,
             u.name as sender_name, u.avatar_url as sender_avatar
      FROM love_notes n
      JOIN users u ON n.sender_id = u.id
      WHERE n.id = ? AND n.couple_id = ?
    `);
    return stmt.get(id, coupleId) || null;
  },

  findByCoupleId(coupleId) {
    const stmt = db.prepare(`
      SELECT n.id, n.couple_id, n.sender_id, n.recipient_id, n.title, n.content, n.unlock_at, n.opened_at, n.created_at,
             u.name as sender_name, u.avatar_url as sender_avatar
      FROM love_notes n
      JOIN users u ON n.sender_id = u.id
      WHERE n.couple_id = ?
      ORDER BY n.created_at DESC
    `);
    return stmt.all(coupleId);
  },

  markOpened(id, coupleId, openedAt) {
    const stmt = db.prepare(`
      UPDATE love_notes
      SET opened_at = ?
      WHERE id = ? AND couple_id = ? AND opened_at IS NULL
    `);
    stmt.run(openedAt, id, coupleId);
    return this.findById(id, coupleId);
  },

  delete(id, coupleId, senderId) {
    const stmt = db.prepare(`
      DELETE FROM love_notes
      WHERE id = ? AND couple_id = ? AND sender_id = ?
    `);
    const result = stmt.run(id, coupleId, senderId);
    return result.changes > 0;
  }
};
