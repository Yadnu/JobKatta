import { Router } from 'express';
import { register, login, logout, refresh, getMe, verifyEmail, forgotPassword, resetPassword, sendOtpHandler, verifyOtpHandler } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { loginRateLimit, otpRateLimit } from '../middleware/rateLimit.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  sendOtpSchema,
  verifyOtpSchema,
} from '../validations/auth.validations.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', loginRateLimit, validate(loginSchema), login);
router.post('/logout', authenticate, logout);
router.post('/refresh', validate(refreshSchema), refresh);
router.get('/verify-email', validate(verifyEmailSchema), verifyEmail);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);
router.post('/send-otp', otpRateLimit, validate(sendOtpSchema), sendOtpHandler);
router.post('/verify-otp', validate(verifyOtpSchema), verifyOtpHandler);
router.get('/me', authenticate, getMe);

export default router;
