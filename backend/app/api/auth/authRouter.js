import { Router } from 'express';
import { authService } from '../../services/authService.js';
import { authenticate } from '../../middleware/authMiddleware.js';

export const authRouter = Router();

authRouter.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, avatarUrl, timezone } = req.body;
    const result = await authService.register({ name, email, password, avatarUrl, timezone });
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: result
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    res.json({
      success: true,
      message: 'Logged in successfully',
      data: result
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/logout', (req, res) => {
  // Stateless JWT tokens are cleared client-side
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

authRouter.get('/me', authenticate, async (req, res, next) => {
  try {
    const result = await authService.getCurrentUser(req.user.id);
    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
});

authRouter.patch('/me/profile', authenticate, async (req, res, next) => {
  try {
    const { name, avatarUrl, timezone } = req.body;
    const updated = await authService.updateProfile(req.user.id, { name, avatarUrl, timezone });
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updated
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/me/change-password', authenticate, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.user.id, { currentPassword, newPassword });
    res.json(result);
  } catch (err) {
    next(err);
  }
});
