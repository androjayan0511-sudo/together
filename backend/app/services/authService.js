import { userRepository } from '../repositories/userRepository.js';
import { coupleRepository } from '../repositories/coupleRepository.js';
import { hashPassword, comparePassword, signToken, generateId } from '../utils/crypto.js';
import { ValidationError, UnauthorizedError, ConflictError, NotFoundError } from '../utils/errors.js';

export const authService = {
  async register({ name, email, password, avatarUrl = null, timezone = 'UTC' }) {
    if (!name || name.trim().length === 0) {
      throw new ValidationError('Name is required');
    }
    if (!email || !email.includes('@')) {
      throw new ValidationError('A valid email address is required');
    }
    if (!password || password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters long');
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = userRepository.findByEmail(cleanEmail);
    if (existingUser) {
      throw new ConflictError('An account with this email address already exists');
    }

    const now = new Date().toISOString();
    const id = generateId('usr');
    const passwordHash = await hashPassword(password);

    const user = userRepository.create({
      id,
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      avatarUrl,
      timezone,
      createdAt: now,
      updatedAt: now
    });

    const token = signToken({ userId: user.id });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        timezone: user.timezone
      },
      token,
      couple: null
    };
  },

  async login({ email, password }) {
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = userRepository.findByEmail(cleanEmail);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = signToken({ userId: user.id });
    const couple = coupleRepository.findByUserId(user.id);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        timezone: user.timezone
      },
      token,
      couple
    };
  },

  async getCurrentUser(userId) {
    const user = userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    const couple = coupleRepository.findByUserId(userId);
    return { user, couple };
  },

  async updateProfile(userId, { name, avatarUrl, timezone }) {
    const now = new Date().toISOString();
    const updatedUser = userRepository.update(userId, {
      name: name !== undefined ? name.trim() : undefined,
      avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined,
      timezone: timezone !== undefined ? timezone : undefined,
      updatedAt: now
    });
    return updatedUser;
  },

  async changePassword(userId, { currentPassword, newPassword }) {
    if (!newPassword || newPassword.length < 6) {
      throw new ValidationError('New password must be at least 6 characters long');
    }

    const user = userRepository.findByIdWithPassword(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isMatch = await comparePassword(currentPassword, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedError('Current password does not match');
    }

    const newHash = await hashPassword(newPassword);
    const now = new Date().toISOString();
    userRepository.updatePassword(userId, newHash, now);

    return { success: true, message: 'Password updated successfully' };
  }
};
