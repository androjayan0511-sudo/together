import { importantDateRepository } from '../repositories/importantDateRepository.js';
import { generateId } from '../utils/crypto.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';

const ALLOWED_TYPES = ['anniversary', 'birthday', 'first_met', 'custom'];

function calculateNextOccurrence(targetDateStr) {
  // Calculates next yearly recurrence or days difference
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(targetDateStr);
  target.setHours(0, 0, 0, 0);

  // Compute days for next annual occurrence
  const thisYearOccurrence = new Date(today.getFullYear(), target.getMonth(), target.getDate());
  let nextDate = thisYearOccurrence;
  if (thisYearOccurrence < today) {
    nextDate = new Date(today.getFullYear() + 1, target.getMonth(), target.getDate());
  }

  const diffMs = nextDate.getTime() - today.getTime();
  const daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return {
    nextOccurrence: nextDate.toISOString().split('T')[0],
    daysUntil
  };
}

export const importantDateService = {
  async createDate(coupleId, { title, date, type = 'custom', reminderEnabled = true }) {
    if (!title || title.trim().length === 0) {
      throw new ValidationError('Date title is required');
    }
    if (!date) {
      throw new ValidationError('Date is required');
    }
    if (!ALLOWED_TYPES.includes(type)) {
      throw new ValidationError(`Type must be one of: ${ALLOWED_TYPES.join(', ')}`);
    }

    const id = generateId('dat');
    const now = new Date().toISOString();

    return importantDateRepository.create({
      id,
      coupleId,
      title: title.trim(),
      date,
      type,
      reminderEnabled: !!reminderEnabled,
      createdAt: now
    });
  },

  async getDates(coupleId) {
    const dates = importantDateRepository.findByCoupleId(coupleId);
    return dates.map((d) => {
      const { nextOccurrence, daysUntil } = calculateNextOccurrence(d.date);
      return {
        ...d,
        next_occurrence: nextOccurrence,
        days_until: daysUntil
      };
    }).sort((a, b) => a.days_until - b.days_until);
  },

  async getUpcomingDate(coupleId) {
    const dates = await this.getDates(coupleId);
    return dates.length > 0 ? dates[0] : null;
  },

  async updateDate(coupleId, dateId, updateData) {
    const existing = importantDateRepository.findById(dateId, coupleId);
    if (!existing) {
      throw new NotFoundError('Date not found');
    }
    return importantDateRepository.update(dateId, coupleId, updateData);
  },

  async deleteDate(coupleId, dateId) {
    const existing = importantDateRepository.findById(dateId, coupleId);
    if (!existing) {
      throw new NotFoundError('Date not found');
    }
    return importantDateRepository.delete(dateId, coupleId);
  }
};
