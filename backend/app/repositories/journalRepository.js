import { db } from '../config/db.js';

export const journalRepository = {
  create({ id, coupleId, authorId, title, content, createdAt, updatedAt }) {
    const stmt = db.prepare(`
      INSERT INTO journal_entries (id, couple_id, author_id, title, content, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, coupleId, authorId, title, content, createdAt, updatedAt);
    return this.findById(id, coupleId);
  },

  findById(id, coupleId) {
    const stmt = db.prepare(`
      SELECT j.id, j.couple_id, j.author_id, j.title, j.content, j.created_at, j.updated_at,
             u.name as author_name, u.avatar_url as author_avatar
      FROM journal_entries j
      JOIN users u ON j.author_id = u.id
      WHERE j.id = ? AND j.couple_id = ?
    `);
    return stmt.get(id, coupleId) || null;
  },

  findByCoupleId(coupleId, { limit = 50, offset = 0 } = {}) {
    const stmt = db.prepare(`
      SELECT j.id, j.couple_id, j.author_id, j.title, j.content, j.created_at, j.updated_at,
             u.name as author_name, u.avatar_url as author_avatar
      FROM journal_entries j
      JOIN users u ON j.author_id = u.id
      WHERE j.couple_id = ?
      ORDER BY j.created_at DESC
      LIMIT ? OFFSET ?
    `);
    return stmt.all(coupleId, limit, offset);
  },

  update(id, coupleId, { title, content, updatedAt }) {
    const fields = [];
    const params = [];

    if (title !== undefined) {
      fields.push('title = ?');
      params.push(title);
    }
    if (content !== undefined) {
      fields.push('content = ?');
      params.push(content);
    }
    fields.push('updated_at = ?');
    params.push(updatedAt);

    params.push(id, coupleId);

    const sql = `UPDATE journal_entries SET ${fields.join(', ')} WHERE id = ? AND couple_id = ?`;
    db.prepare(sql).run(...params);
    return this.findById(id, coupleId);
  },

  delete(id, coupleId) {
    const stmt = db.prepare(`DELETE FROM journal_entries WHERE id = ? AND couple_id = ?`);
    const result = stmt.run(id, coupleId);
    return result.changes > 0;
  }
};
