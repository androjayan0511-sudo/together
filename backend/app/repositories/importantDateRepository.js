import { db } from '../config/db.js';

export const importantDateRepository = {
  create({ id, coupleId, title, date, type, reminderEnabled = 1, createdAt }) {
    const stmt = db.prepare(`
      INSERT INTO important_dates (id, couple_id, title, date, type, reminder_enabled, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, coupleId, title, date, type, reminderEnabled ? 1 : 0, createdAt);
    return this.findById(id, coupleId);
  },

  findById(id, coupleId) {
    const stmt = db.prepare(`
      SELECT id, couple_id, title, date, type, reminder_enabled, created_at
      FROM important_dates
      WHERE id = ? AND couple_id = ?
    `);
    return stmt.get(id, coupleId) || null;
  },

  findByCoupleId(coupleId) {
    const stmt = db.prepare(`
      SELECT id, couple_id, title, date, type, reminder_enabled, created_at
      FROM important_dates
      WHERE couple_id = ?
      ORDER BY date ASC
    `);
    return stmt.all(coupleId);
  },

  update(id, coupleId, { title, date, type, reminderEnabled }) {
    const fields = [];
    const params = [];

    if (title !== undefined) {
      fields.push('title = ?');
      params.push(title);
    }
    if (date !== undefined) {
      fields.push('date = ?');
      params.push(date);
    }
    if (type !== undefined) {
      fields.push('type = ?');
      params.push(type);
    }
    if (reminderEnabled !== undefined) {
      fields.push('reminder_enabled = ?');
      params.push(reminderEnabled ? 1 : 0);
    }

    params.push(id, coupleId);

    const sql = `UPDATE important_dates SET ${fields.join(', ')} WHERE id = ? AND couple_id = ?`;
    db.prepare(sql).run(...params);
    return this.findById(id, coupleId);
  },

  delete(id, coupleId) {
    const stmt = db.prepare(`DELETE FROM important_dates WHERE id = ? AND couple_id = ?`);
    const result = stmt.run(id, coupleId);
    return result.changes > 0;
  }
};
