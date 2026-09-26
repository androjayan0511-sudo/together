import { db } from '../config/db.js';

export const checkInRepository = {
  create({ id, coupleId, userId, mood, note = null, createdAt }) {
    const stmt = db.prepare(`
      INSERT INTO check_ins (id, couple_id, user_id, mood, note, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, coupleId, userId, mood, note, createdAt);
    return this.findById(id);
  },

  findById(id) {
    const stmt = db.prepare(`
      SELECT c.id, c.couple_id, c.user_id, c.mood, c.note, c.created_at,
             u.name as user_name, u.avatar_url as user_avatar
      FROM check_ins c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `);
    return stmt.get(id) || null;
  },

  getLatestByUserId(userId, coupleId) {
    const stmt = db.prepare(`
      SELECT c.id, c.couple_id, c.user_id, c.mood, c.note, c.created_at,
             u.name as user_name, u.avatar_url as user_avatar
      FROM check_ins c
      JOIN users u ON c.user_id = u.id
      WHERE c.user_id = ? AND c.couple_id = ?
      ORDER BY c.created_at DESC
      LIMIT 1
    `);
    return stmt.get(userId, coupleId) || null;
  },

  getLatestForCouple(coupleId) {
    // Return the latest checkin for each user in this couple
    const stmt = db.prepare(`
      SELECT c.id, c.couple_id, c.user_id, c.mood, c.note, c.created_at,
             u.name as user_name, u.avatar_url as user_avatar
      FROM check_ins c
      JOIN users u ON c.user_id = u.id
      WHERE c.couple_id = ?
        AND c.created_at = (
          SELECT MAX(inner_c.created_at)
          FROM check_ins inner_c
          WHERE inner_c.user_id = c.user_id AND inner_c.couple_id = c.couple_id
        )
      ORDER BY c.created_at DESC
    `);
    return stmt.all(coupleId);
  },

  getHistory(coupleId, limit = 20) {
    const stmt = db.prepare(`
      SELECT c.id, c.couple_id, c.user_id, c.mood, c.note, c.created_at,
             u.name as user_name, u.avatar_url as user_avatar
      FROM check_ins c
      JOIN users u ON c.user_id = u.id
      WHERE c.couple_id = ?
      ORDER BY c.created_at DESC
      LIMIT ?
    `);
    return stmt.all(coupleId, limit);
  }
};
