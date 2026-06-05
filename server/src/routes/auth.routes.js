import { Router } from 'express';
import { register, login, logout, refresh, getMe, verifyEmail, forgotPassword, resetPassword, sendOtpHandler, verifyOtpHandler } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { loginRateLimit, otpRateLimit } from '../middleware/rateLimit.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', loginRateLimit, login);
router.post('/logout', authenticate, logout);
router.post('/refresh', refresh);
router.get('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/send-otp', otpRateLimit, sendOtpHandler);
router.post('/verify-otp', verifyOtpHandler);
router.get('/me', authenticate, getMe);

export default router;
