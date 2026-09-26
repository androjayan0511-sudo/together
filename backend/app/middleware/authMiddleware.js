import { verifyToken } from '../utils/crypto.js';
import { userRepository } from '../repositories/userRepository.js';
import { UnauthorizedError } from '../utils/errors.js';

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token is required');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      throw new UnauthorizedError('Invalid or expired authentication session');
    }

    const user = userRepository.findById(decoded.userId);
    if (!user) {
      throw new UnauthorizedError('User account not found');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
