import { coupleRepository } from '../repositories/coupleRepository.js';
import { ForbiddenError } from '../utils/errors.js';

export async function requireCouple(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      throw new ForbiddenError('User must be authenticated');
    }

    const couple = coupleRepository.findByUserId(req.user.id);
    if (!couple) {
      throw new ForbiddenError('You need an active couple space to access this feature');
    }

    req.couple = couple;
    req.coupleId = couple.id;

    // Determine partner
    const isUserOne = couple.user_one_id === req.user.id;
    req.partner = isUserOne ? couple.user_two : couple.user_one;
    req.partnerId = isUserOne ? couple.user_two_id : couple.user_one_id;

    next();
  } catch (err) {
    next(err);
  }
}
