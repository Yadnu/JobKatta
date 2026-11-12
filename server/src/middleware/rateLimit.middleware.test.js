import { beforeEach, describe, expect, it, vi } from 'vitest';

const { redisState, rateLimitMock, RedisStoreMock, redisCallMock, ipKeyGeneratorMock } = vi.hoisted(() => ({
  redisState: { status: 'ready' },
  rateLimitMock: vi.fn((options) => options),
  RedisStoreMock: vi.fn(function RedisStore(options) {
    return { kind: 'redis-store', ...options };
  }),
  redisCallMock: vi.fn(),
  ipKeyGeneratorMock: vi.fn((req) => `ip:${req.ip}`),
}));

vi.mock('express-rate-limit', () => ({
  default: rateLimitMock,
  ipKeyGenerator: ipKeyGeneratorMock,
}));

vi.mock('rate-limit-redis', () => ({
  RedisStore: RedisStoreMock,
}));

vi.mock('../config/redis.js', () => ({
  default: {
    get status() {
      return redisState.status;
    },
    call: (...args) => redisCallMock(...args),
  },
}));

const load = async (status) => {
  vi.resetModules();
  redisState.status = status;
  return import('./rateLimit.middleware.js');
};

beforeEach(() => {
  vi.clearAllMocks();
  redisState.status = 'ready';
});

describe('rate limiters when Redis is ready', () => {
  it('builds login, otp, general, and upload limiters with Redis stores', async () => {
    const limits = await load('ready');

    expect(limits.loginRateLimit).toMatchObject({
      windowMs: 15 * 60 * 1000,
      max: 5,
      message: { success: false, message: 'Too many login attempts. Try again after 15 minutes.' },
      standardHeaders: true,
      legacyHeaders: false,
    });
    expect(limits.loginRateLimit.store.prefix).toBe('rl:login:');

    expect(limits.otpRateLimit).toMatchObject({
      windowMs: 10 * 60 * 1000,
      max: 3,
      message: { success: false, message: 'Too many OTP requests. Try again after 10 minutes.' },
    });
    expect(limits.otpRateLimit.store.prefix).toBe('rl:otp:');

    expect(limits.generalApiLimit).toMatchObject({ windowMs: 60 * 1000, max: 100 });
    expect(limits.generalApiLimit.store.prefix).toBe('rl:general:');
    expect(limits.generalApiLimit.message.message).toBe('Too many requests. Please slow down.');

    expect(limits.uploadRateLimit).toMatchObject({ windowMs: 10 * 60 * 1000, max: 10 });
    expect(limits.uploadRateLimit.store.prefix).toBe('rl:upload:');
    expect(limits.uploadRateLimit.message.message).toBe('Too many upload requests.');
  });

  it('forwards Redis store commands through the shared client', async () => {
    const limits = await load('connect');
    redisCallMock.mockResolvedValue('OK');
    await limits.loginRateLimit.store.sendCommand('GET', 'rl:login:1');
    expect(redisCallMock).toHaveBeenCalledWith('GET', 'rl:login:1');
  });

  it('keys OTP attempts by mobile, and by IP when mobile is absent', async () => {
    const limits = await load('ready');
    expect(limits.otpRateLimit.keyGenerator({ body: { mobile: '9876543210' }, ip: '1.2.3.4' })).toBe('9876543210');
    expect(limits.otpRateLimit.keyGenerator({ body: {}, ip: '1.2.3.4' })).toBe('ip:1.2.3.4');
    expect(ipKeyGeneratorMock).toHaveBeenCalledWith({ body: {}, ip: '1.2.3.4' });
  });
});

describe('rate limiters when Redis is not reachable', () => {
  it('omits the store so express-rate-limit uses memory', async () => {
    const limits = await load('wait');
    expect(RedisStoreMock).not.toHaveBeenCalled();
    expect(limits.loginRateLimit.store).toBeUndefined();
    expect(limits.otpRateLimit.store).toBeUndefined();
    expect(limits.generalApiLimit.store).toBeUndefined();
    expect(limits.uploadRateLimit.store).toBeUndefined();
  });
});
