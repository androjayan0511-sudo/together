import { memoryRepository } from '../repositories/memoryRepository.js';
import { generateId } from '../utils/crypto.js';
import { ValidationError, NotFoundError, ForbiddenError } from '../utils/errors.js';

export const memoryService = {
  async createMemory(coupleId, userId, { title, description = null, memoryDate, location = null, imageUrl = null }) {
    if (!title || title.trim().length === 0) {
      throw new ValidationError('Memory title is required');
    }
    if (!memoryDate) {
      throw new ValidationError('Memory date is required');
    }

    const id = generateId('mem');
    const now = new Date().toISOString();

    return memoryRepository.create({
      id,
      coupleId,
      createdBy: userId,
      title: title.trim(),
      description: description ? description.trim() : null,
      memoryDate,
      location: location ? location.trim() : null,
      imageUrl,
      createdAt: now,
      updatedAt: now
    });
  },

  async getMemories(coupleId, { limit = 50, offset = 0 } = {}) {
    return memoryRepository.findByCoupleId(coupleId, { limit, offset });
  },

  async getMemoryById(coupleId, memoryId) {
    const memory = memoryRepository.findById(memoryId, coupleId);
    if (!memory) {
      throw new NotFoundError('Memory not found');
    }
    return memory;
  },

  async getRecentMemory(coupleId) {
    return memoryRepository.getRecentMemory(coupleId);
  },

  async updateMemory(coupleId, memoryId, userId, { title, description, memoryDate, location, imageUrl }) {
    const existing = memoryRepository.findById(memoryId, coupleId);
    if (!existing) {
      throw new NotFoundError('Memory not found or does not belong to your couple space');
    }

    const now = new Date().toISOString();
    return memoryRepository.update(memoryId, coupleId, {
      title: title !== undefined ? title.trim() : undefined,
      description: description !== undefined ? (description ? description.trim() : null) : undefined,
      memoryDate: memoryDate !== undefined ? memoryDate : undefined,
      location: location !== undefined ? (location ? location.trim() : null) : undefined,
      imageUrl: imageUrl !== undefined ? imageUrl : undefined,
      updatedAt: now
    });
  },

  async deleteMemory(coupleId, memoryId, userId) {
    const existing = memoryRepository.findById(memoryId, coupleId);
    if (!existing) {
      throw new NotFoundError('Memory not found or does not belong to your couple space');
    }

    return memoryRepository.delete(memoryId, coupleId);
  }
};
