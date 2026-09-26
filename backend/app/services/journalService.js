import { journalRepository } from '../repositories/journalRepository.js';
import { generateId } from '../utils/crypto.js';
import { ValidationError, NotFoundError, ForbiddenError } from '../utils/errors.js';

export const journalService = {
  async createEntry(coupleId, authorId, { title, content }) {
    if (!title || title.trim().length === 0) {
      throw new ValidationError('Journal title is required');
    }
    if (!content || content.trim().length === 0) {
      throw new ValidationError('Journal content is required');
    }

    const id = generateId('jrn');
    const now = new Date().toISOString();

    return journalRepository.create({
      id,
      coupleId,
      authorId,
      title: title.trim(),
      content: content.trim(),
      createdAt: now,
      updatedAt: now
    });
  },

  async getEntries(coupleId, { limit = 50, offset = 0 } = {}) {
    return journalRepository.findByCoupleId(coupleId, { limit, offset });
  },

  async getEntryById(coupleId, entryId) {
    const entry = journalRepository.findById(entryId, coupleId);
    if (!entry) {
      throw new NotFoundError('Journal entry not found');
    }
    return entry;
  },

  async updateEntry(coupleId, entryId, userId, { title, content }) {
    const existing = journalRepository.findById(entryId, coupleId);
    if (!existing) {
      throw new NotFoundError('Journal entry not found');
    }

    if (existing.author_id !== userId) {
      throw new ForbiddenError('Only the author can edit this journal entry');
    }

    const now = new Date().toISOString();
    return journalRepository.update(entryId, coupleId, {
      title: title !== undefined ? title.trim() : undefined,
      content: content !== undefined ? content.trim() : undefined,
      updatedAt: now
    });
  },

  async deleteEntry(coupleId, entryId, userId) {
    const existing = journalRepository.findById(entryId, coupleId);
    if (!existing) {
      throw new NotFoundError('Journal entry not found');
    }

    if (existing.author_id !== userId) {
      throw new ForbiddenError('Only the author can delete this journal entry');
    }

    return journalRepository.delete(entryId, coupleId);
  }
};
