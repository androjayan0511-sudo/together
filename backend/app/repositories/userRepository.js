import { db } from '../config/db.js';

export const userRepository = {
  create({ id, name, email, passwordHash, avatarUrl = null, timezone = 'UTC', createdAt, updatedAt }) {
    const stmt = db.prepare(`
      INSERT INTO users (id, name, email, password_hash, avatar_url, timezone, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, name, email, passwordHash, avatarUrl, timezone, createdAt, updatedAt);
    return this.findById(id);
  },

  findById(id) {
    const stmt = db.prepare(`
      SELECT id, name, email, avatar_url, timezone, created_at, updated_at
      FROM users
      WHERE id = ?
    `);
    return stmt.get(id) || null;
  },

  findByIdWithPassword(id) {
    const stmt = db.prepare(`
      SELECT id, name, email, password_hash, avatar_url, timezone, created_at, updated_at
      FROM users
      WHERE id = ?
    `);
    return stmt.get(id) || null;
  },

  findByEmail(email) {
    const stmt = db.prepare(`
      SELECT id, name, email, password_hash, avatar_url, timezone, created_at, updated_at
      FROM users
      WHERE LOWER(email) = LOWER(?)
    `);
    return stmt.get(email) || null;
  },

  update(id, { name, avatarUrl, timezone, updatedAt }) {
    const fields = [];
    const params = [];

    if (name !== undefined) {
      fields.push('name = ?');
      params.push(name);
    }
    if (avatarUrl !== undefined) {
      fields.push('avatar_url = ?');
      params.push(avatarUrl);
    }
    if (timezone !== undefined) {
      fields.push('timezone = ?');
      params.push(timezone);
    }
    fields.push('updated_at = ?');
    params.push(updatedAt);

    params.push(id);

    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    db.prepare(sql).run(...params);
    return this.findById(id);
  },

  updatePassword(id, passwordHash, updatedAt) {
    const stmt = db.prepare(`
      UPDATE users
      SET password_hash = ?, updated_at = ?
      WHERE id = ?
    `);
    stmt.run(passwordHash, updatedAt, id);
    return true;
  }
};
