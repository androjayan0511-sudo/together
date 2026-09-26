import { coupleRepository } from '../repositories/coupleRepository.js';
import { notificationRepository } from '../repositories/notificationRepository.js';
import { generateId, generatePairingCode } from '../utils/crypto.js';
import { ValidationError, ConflictError, NotFoundError, ForbiddenError } from '../utils/errors.js';

export const coupleService = {
  async createCouple(userId, { relationshipStartDate = null } = {}) {
    // 1. Verify user does not already belong to an active couple
    const existing = coupleRepository.findByUserId(userId);
    if (existing) {
      throw new ConflictError('You already have an active couple space');
    }

    const id = generateId('cpl');
    let pairingCode = generatePairingCode();

    // Ensure unique pairing code in rare collision
    let attempts = 0;
    while (coupleRepository.findByPairingCode(pairingCode) && attempts < 5) {
      pairingCode = generatePairingCode();
      attempts++;
    }

    const now = new Date().toISOString();
    const couple = coupleRepository.create({
      id,
      pairingCode,
      userOneId: userId,
      relationshipStartDate,
      createdAt: now,
      updatedAt: now
    });

    return couple;
  },

  async joinCouple(userId, pairingCode) {
    if (!pairingCode || pairingCode.trim().length === 0) {
      throw new ValidationError('A pairing code is required');
    }

    const cleanCode = pairingCode.trim().toUpperCase();
    const targetCouple = coupleRepository.findByPairingCode(cleanCode);

    // If user is trying to join the exact space they created
    if (targetCouple && targetCouple.user_one_id === userId) {
      throw new ValidationError('You created this space! Share the code with your partner instead.');
    }

    // Verify user is not already in a couple
    const existingCouple = coupleRepository.findByUserId(userId);
    if (existingCouple) {
      throw new ConflictError('You are already connected to a couple space. Leave your current space first.');
    }

    // Find couple by pairing code
    if (!targetCouple) {
      throw new NotFoundError('No couple space found matching this pairing code. Please double-check with your partner.');
    }

    // Check if space is already full
    if (targetCouple.user_two_id) {
      throw new ConflictError('This couple space is already full with two partners.');
    }

    // Join couple
    const now = new Date().toISOString();
    const updatedCouple = coupleRepository.joinCouple(targetCouple.id, userId, now);

    // Notify user one that partner joined
    notificationRepository.create({
      id: generateId('ntf'),
      userId: targetCouple.user_one_id,
      type: 'partner_joined',
      title: 'Partner Connected',
      body: 'Your partner has joined your TogetherMiles space!',
      createdAt: now
    });

    return updatedCouple;
  },

  async getCoupleInfo(userId) {
    const couple = coupleRepository.findByUserId(userId);
    if (!couple) {
      return null;
    }

    const isUserOne = couple.user_one_id === userId;
    const partner = isUserOne ? couple.user_two : couple.user_one;
    const isConnected = !!(couple.user_one_id && couple.user_two_id);

    // Calculate days together if relationship_start_date is set
    let daysTogether = null;
    if (couple.relationship_start_date) {
      const start = new Date(couple.relationship_start_date);
      const today = new Date();
      const diffTime = today.getTime() - start.getTime();
      daysTogether = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
    }

    return {
      ...couple,
      partner,
      isConnected,
      daysTogether
    };
  },

  async updateStartDate(userId, coupleId, startDate) {
    const couple = coupleRepository.findById(coupleId);
    if (!couple || (couple.user_one_id !== userId && couple.user_two_id !== userId)) {
      throw new ForbiddenError('Unauthorized access to this couple space');
    }

    const now = new Date().toISOString();
    return coupleRepository.updateStartDate(coupleId, startDate, now);
  },

  async leaveCouple(userId, coupleId) {
    const couple = coupleRepository.findById(coupleId);
    if (!couple || (couple.user_one_id !== userId && couple.user_two_id !== userId)) {
      throw new ForbiddenError('Unauthorized access to this couple space');
    }

    const now = new Date().toISOString();
    const otherUserId = couple.user_one_id === userId ? couple.user_two_id : couple.user_one_id;

    if (otherUserId) {
      notificationRepository.create({
        id: generateId('ntf'),
        userId: otherUserId,
        type: 'partner_left',
        title: 'Couple Space Disconnected',
        body: 'Your partner has disconnected from your shared space.',
        createdAt: now
      });
    }

    return coupleRepository.leaveCouple(coupleId, userId, now);
  }
};
