import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import redis from '../config/redis.js';

// Use RedisStore only when Redis is reachable; otherwise fall back to the
// default in-memory store so the server starts cleanly in development.
const makeStore = (prefix) => {
  const reachable = ['connect', 'ready'].includes(redis.status);
  if (!reachable) return undefined;
  return new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix,
  });
};

export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, max: 5,
  store: makeStore('rl:login:'),
  message: { success: false, message: 'Too many login attempts. Try again after 15 minutes.' },
  standardHeaders: true, legacyHeaders: false,
});

export const otpRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, max: 3,
  store: makeStore('rl:otp:'),
  // Use mobile number as key when available, otherwise fall back to the
  // ipKeyGenerator helper so IPv6 addresses are handled correctly.
  keyGenerator: (req) => req.body?.mobile ?? ipKeyGenerator(req),
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
