import { db } from '../config/db.js';

export const memoryRepository = {
  create({ id, coupleId, createdBy, title, description = null, memoryDate, location = null, imageUrl = null, createdAt, updatedAt }) {
    const stmt = db.prepare(`
      INSERT INTO memories (id, couple_id, created_by, title, description, memory_date, location, image_url, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, coupleId, createdBy, title, description, memoryDate, location, imageUrl, createdAt, updatedAt);
    return this.findById(id, coupleId);
  },

  findById(id, coupleId) {
    const stmt = db.prepare(`
      SELECT m.id, m.couple_id, m.created_by, m.title, m.description, m.memory_date, m.location, m.image_url,
             m.created_at, m.updated_at, u.name as creator_name, u.avatar_url as creator_avatar
      FROM memories m
      JOIN users u ON m.created_by = u.id
      WHERE m.id = ? AND m.couple_id = ?
    `);
    return stmt.get(id, coupleId) || null;
  },

  findByCoupleId(coupleId, { limit = 50, offset = 0 } = {}) {
    const stmt = db.prepare(`
      SELECT m.id, m.couple_id, m.created_by, m.title, m.description, m.memory_date, m.location, m.image_url,
             m.created_at, m.updated_at, u.name as creator_name, u.avatar_url as creator_avatar
      FROM memories m
      JOIN users u ON m.created_by = u.id
      WHERE m.couple_id = ?
      ORDER BY m.memory_date DESC, m.created_at DESC
      LIMIT ? OFFSET ?
    `);
    return stmt.all(coupleId, limit, offset);
  },

  getRecentMemory(coupleId) {
    const stmt = db.prepare(`
      SELECT m.id, m.couple_id, m.created_by, m.title, m.description, m.memory_date, m.location, m.image_url,
             m.created_at, m.updated_at, u.name as creator_name, u.avatar_url as creator_avatar
      FROM memories m
      JOIN users u ON m.created_by = u.id
      WHERE m.couple_id = ?
      ORDER BY m.memory_date DESC, m.created_at DESC
      LIMIT 1
    `);
    return stmt.get(coupleId) || null;
  },

  update(id, coupleId, { title, description, memoryDate, location, imageUrl, updatedAt }) {
    const fields = [];
    const params = [];

    if (title !== undefined) {
      fields.push('title = ?');
      params.push(title);
    }
    if (description !== undefined) {
      fields.push('description = ?');
      params.push(description);
    }
    if (memoryDate !== undefined) {
      fields.push('memory_date = ?');
      params.push(memoryDate);
    }
    if (location !== undefined) {
      fields.push('location = ?');
      params.push(location);
    }
    if (imageUrl !== undefined) {
      fields.push('image_url = ?');
      params.push(imageUrl);
    }
    fields.push('updated_at = ?');
    params.push(updatedAt);

    params.push(id, coupleId);

    const sql = `UPDATE memories SET ${fields.join(', ')} WHERE id = ? AND couple_id = ?`;
    db.prepare(sql).run(...params);
    return this.findById(id, coupleId);
  },

  delete(id, coupleId) {
    const stmt = db.prepare(`DELETE FROM memories WHERE id = ? AND couple_id = ?`);
    const result = stmt.run(id, coupleId);
    return result.changes > 0;
  }
};
