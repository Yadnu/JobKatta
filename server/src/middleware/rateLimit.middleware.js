import rateLimit from 'express-rate-limit';

export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, max: 5,
  message: { success: false, message: 'Too many login attempts. Try again after 15 minutes.' },
  standardHeaders: true, legacyHeaders: false,
});

export const otpRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, max: 3,
  keyGenerator: (req) => req.body?.mobile || req.ip,
  message: { success: false, message: 'Too many OTP requests. Try again after 10 minutes.' },
  standardHeaders: true, legacyHeaders: false,
});

export const generalApiLimit = rateLimit({
  windowMs: 60 * 1000, max: 100,
  message: { success: false, message: 'Too many requests. Please slow down.' },
  standardHeaders: true, legacyHeaders: false,
});

export const uploadRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, max: 10,
  message: { success: false, message: 'Too many upload requests.' },
  standardHeaders: true, legacyHeaders: false,
});
