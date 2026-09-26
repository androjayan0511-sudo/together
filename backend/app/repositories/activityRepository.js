import { db } from '../config/db.js';

export const activityRepository = {
  findAll() {
    const stmt = db.prepare(`SELECT * FROM activities ORDER BY id ASC`);
    return stmt.all();
  },

  findById(id) {
    const stmt = db.prepare(`SELECT * FROM activities WHERE id = ?`);
    return stmt.get(id) || null;
  },

  findByCategory(category) {
    const stmt = db.prepare(`SELECT * FROM activities WHERE category = ? ORDER BY id ASC`);
    return stmt.all(category);
  }
};
