import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import redis from '../config/redis.js';

// Shared Redis store factory — limits persist across all PM2 cluster workers
const makeStore = (prefix) =>
  new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix,
  });

export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, max: 5,
  store: makeStore('rl:login:'),
  message: { success: false, message: 'Too many login attempts. Try again after 15 minutes.' },
  standardHeaders: true, legacyHeaders: false,
});

export const otpRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, max: 3,
  store: makeStore('rl:otp:'),
  keyGenerator: (req) => req.body?.mobile || req.ip,
  message: { success: false, message: 'Too many OTP requests. Try again after 10 minutes.' },
  standardHeaders: true, legacyHeaders: false,
});

export const generalApiLimit = rateLimit({
  windowMs: 60 * 1000, max: 100,
  store: makeStore('rl:general:'),
  message: { success: false, message: 'Too many requests. Please slow down.' },
  standardHeaders: true, legacyHeaders: false,
});

export const uploadRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, max: 10,
  store: makeStore('rl:upload:'),
  message: { success: false, message: 'Too many upload requests.' },
  standardHeaders: true, legacyHeaders: false,
});
