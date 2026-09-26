import { db } from '../config/db.js';

function formatCoupleRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    pairing_code: row.pairing_code,
    user_one_id: row.user_one_id,
    user_two_id: row.user_two_id,
    relationship_start_date: row.relationship_start_date,
    created_at: row.created_at,
    updated_at: row.updated_at,
    user_one: row.u1_id ? {
      id: row.u1_id,
      name: row.u1_name,
      email: row.u1_email,
      avatar_url: row.u1_avatar,
      timezone: row.u1_tz
    } : null,
    user_two: row.u2_id ? {
      id: row.u2_id,
      name: row.u2_name,
      email: row.u2_email,
      avatar_url: row.u2_avatar,
      timezone: row.u2_tz
    } : null
  };
}

const COUPLE_JOIN_QUERY = `
  SELECT 
    c.id, c.pairing_code, c.user_one_id, c.user_two_id, c.relationship_start_date, c.created_at, c.updated_at,
    u1.id as u1_id, u1.name as u1_name, u1.email as u1_email, u1.avatar_url as u1_avatar, u1.timezone as u1_tz,
    u2.id as u2_id, u2.name as u2_name, u2.email as u2_email, u2.avatar_url as u2_avatar, u2.timezone as u2_tz
  FROM couples c
  LEFT JOIN users u1 ON c.user_one_id = u1.id
  LEFT JOIN users u2 ON c.user_two_id = u2.id
`;

export const coupleRepository = {
  create({ id, pairingCode, userOneId, relationshipStartDate = null, createdAt, updatedAt }) {
    const stmt = db.prepare(`
      INSERT INTO couples (id, pairing_code, user_one_id, relationship_start_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, pairingCode, userOneId, relationshipStartDate, createdAt, updatedAt);
    return this.findById(id);
  },

  findById(id) {
    const stmt = db.prepare(`${COUPLE_JOIN_QUERY} WHERE c.id = ?`);
    const row = stmt.get(id);
    return formatCoupleRow(row);
  },

  findByUserId(userId) {
    const stmt = db.prepare(`${COUPLE_JOIN_QUERY} WHERE c.user_one_id = ? OR c.user_two_id = ? LIMIT 1`);
    const row = stmt.get(userId, userId);
    return formatCoupleRow(row);
  },

  findByPairingCode(pairingCode) {
    const stmt = db.prepare(`${COUPLE_JOIN_QUERY} WHERE UPPER(c.pairing_code) = UPPER(?)`);
    const row = stmt.get(pairingCode.trim());
    return formatCoupleRow(row);
  },

  joinCouple(coupleId, userTwoId, updatedAt) {
    const stmt = db.prepare(`
      UPDATE couples
      SET user_two_id = ?, updated_at = ?
      WHERE id = ? AND user_two_id IS NULL
    `);
    const result = stmt.run(userTwoId, updatedAt, coupleId);
    return result.changes > 0 ? this.findById(coupleId) : null;
  },

  updateStartDate(coupleId, startDate, updatedAt) {
    const stmt = db.prepare(`
      UPDATE couples
      SET relationship_start_date = ?, updated_at = ?
      WHERE id = ?
    `);
    stmt.run(startDate, updatedAt, coupleId);
    return this.findById(coupleId);
  },

  leaveCouple(coupleId, userId, updatedAt) {
    const couple = this.findById(coupleId);
    if (!couple) return false;

    if (couple.user_two_id === userId) {
      // User two left, unlink them
      db.prepare(`UPDATE couples SET user_two_id = NULL, updated_at = ? WHERE id = ?`).run(updatedAt, coupleId);
      return true;
    } else if (couple.user_one_id === userId) {
      if (couple.user_two_id) {
        // Promote user two to user one
        db.prepare(`UPDATE couples SET user_one_id = ?, user_two_id = NULL, updated_at = ? WHERE id = ?`).run(couple.user_two_id, updatedAt, coupleId);
        return true;
      } else {
        // Nobody left, delete the couple
        db.prepare(`DELETE FROM couples WHERE id = ?`).run(coupleId);
        return true;
      }
    }
    return false;
  }
};
