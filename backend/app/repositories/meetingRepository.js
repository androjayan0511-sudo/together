import { db } from '../config/db.js';

export const meetingRepository = {
  create({ id, coupleId, title, meetingAt, location = null, note = null, createdAt }) {
    const stmt = db.prepare(`
      INSERT INTO meetings (id, couple_id, title, meeting_at, location, note, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, coupleId, title, meetingAt, location, note, createdAt);
    return this.findById(id, coupleId);
  },

  findById(id, coupleId) {
    const stmt = db.prepare(`
      SELECT id, couple_id, title, meeting_at, location, note, created_at
      FROM meetings
      WHERE id = ? AND couple_id = ?
    `);
    return stmt.get(id, coupleId) || null;
  },

  getNextMeeting(coupleId) {
    // Find the next upcoming meeting (or latest created if in future)
    const nowIso = new Date().toISOString();
    const stmt = db.prepare(`
      SELECT id, couple_id, title, meeting_at, location, note, created_at
      FROM meetings
      WHERE couple_id = ? AND meeting_at >= ?
      ORDER BY meeting_at ASC
      LIMIT 1
    `);
    const upcoming = stmt.get(coupleId, nowIso);
    if (upcoming) return upcoming;

    // Fallback: return the most recently scheduled meeting even if past
    const fallbackStmt = db.prepare(`
      SELECT id, couple_id, title, meeting_at, location, note, created_at
      FROM meetings
      WHERE couple_id = ?
      ORDER BY meeting_at DESC
      LIMIT 1
    `);
    return fallbackStmt.get(coupleId) || null;
  },

  findByCoupleId(coupleId) {
    const stmt = db.prepare(`
      SELECT id, couple_id, title, meeting_at, location, note, created_at
      FROM meetings
      WHERE couple_id = ?
      ORDER BY meeting_at ASC
    `);
    return stmt.all(coupleId);
  },

  update(id, coupleId, { title, meetingAt, location, note }) {
    const fields = [];
    const params = [];

    if (title !== undefined) {
      fields.push('title = ?');
      params.push(title);
    }
    if (meetingAt !== undefined) {
      fields.push('meeting_at = ?');
      params.push(meetingAt);
    }
    if (location !== undefined) {
      fields.push('location = ?');
      params.push(location);
    }
    if (note !== undefined) {
      fields.push('note = ?');
      params.push(note);
    }

    params.push(id, coupleId);

    const sql = `UPDATE meetings SET ${fields.join(', ')} WHERE id = ? AND couple_id = ?`;
    db.prepare(sql).run(...params);
    return this.findById(id, coupleId);
  },

  delete(id, coupleId) {
    const stmt = db.prepare(`DELETE FROM meetings WHERE id = ? AND couple_id = ?`);
    const result = stmt.run(id, coupleId);
    return result.changes > 0;
  }
};
