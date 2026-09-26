import { meetingRepository } from '../repositories/meetingRepository.js';
import { generateId } from '../utils/crypto.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';

export const meetingService = {
  async createMeeting(coupleId, { title, meetingAt, location = null, note = null }) {
    if (!title || title.trim().length === 0) {
      throw new ValidationError('Meeting title is required');
    }
    if (!meetingAt) {
      throw new ValidationError('Meeting date and time is required');
    }

    const meetingDate = new Date(meetingAt);
    if (isNaN(meetingDate.getTime())) {
      throw new ValidationError('Invalid meeting date format');
    }

    const id = generateId('mtg');
    const now = new Date().toISOString();

    return meetingRepository.create({
      id,
      coupleId,
      title: title.trim(),
      meetingAt: meetingDate.toISOString(),
      location: location ? location.trim() : null,
      note: note ? note.trim() : null,
      createdAt: now
    });
  },

  async getNextMeeting(coupleId) {
    return meetingRepository.getNextMeeting(coupleId);
  },

  async getAllMeetings(coupleId) {
    return meetingRepository.findByCoupleId(coupleId);
  },

  async updateMeeting(coupleId, meetingId, updateData) {
    const existing = meetingRepository.findById(meetingId, coupleId);
    if (!existing) {
      throw new NotFoundError('Meeting not found');
    }
    return meetingRepository.update(meetingId, coupleId, updateData);
  },

  async deleteMeeting(coupleId, meetingId) {
    const existing = meetingRepository.findById(meetingId, coupleId);
    if (!existing) {
      throw new NotFoundError('Meeting not found');
    }
    return meetingRepository.delete(meetingId, coupleId);
  }
};
