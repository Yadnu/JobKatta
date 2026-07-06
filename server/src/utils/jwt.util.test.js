import { beforeAll, describe, expect, it } from 'vitest';
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from './jwt.util.js';

beforeAll(() => {
  process.env.JWT_SECRET = 'test-access-secret-at-least-64-characters-long-for-testing-purposes-only!';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-at-least-64-characters-long-for-testing-only!!';
  process.env.JWT_ACCESS_EXPIRES_IN = '15m';
  process.env.JWT_REFRESH_EXPIRES_IN = '30d';
});

describe('signAccessToken / verifyAccessToken', () => {
  it('signs a payload and verifies the resulting token', () => {
    const payload = { userId: '123', role: 'CANDIDATE' };
    const token = signAccessToken(payload);
    const decoded = verifyAccessToken(token);
    expect(decoded.userId).toBe('123');
    expect(decoded.role).toBe('CANDIDATE');
  });

  it('includes standard JWT fields (iat, exp)', () => {
    const token = signAccessToken({ userId: 'abc' });
    const decoded = verifyAccessToken(token);
    expect(decoded.iat).toBeDefined();
    expect(decoded.exp).toBeDefined();
    expect(decoded.exp).toBeGreaterThan(decoded.iat);
  });

  it('throws JsonWebTokenError when the token is tampered with', () => {
    const token = signAccessToken({ userId: 'abc' });
    const tampered = token.slice(0, -4) + 'xxxx';
    expect(() => verifyAccessToken(tampered)).toThrow();
  });

  it('throws when an access token is verified with the refresh secret', () => {
    const refreshToken = signRefreshToken({ userId: 'abc' });
    expect(() => verifyAccessToken(refreshToken)).toThrow();
  });
});

describe('signRefreshToken / verifyRefreshToken', () => {
  it('signs a payload and verifies the resulting refresh token', () => {
    const payload = { userId: '456', role: 'EMPLOYER' };
    const token = signRefreshToken(payload);
    const decoded = verifyRefreshToken(token);
    expect(decoded.userId).toBe('456');
    expect(decoded.role).toBe('EMPLOYER');
  });

  it('throws when a refresh token is verified with the access secret', () => {
    const accessToken = signAccessToken({ userId: 'abc' });
    expect(() => verifyRefreshToken(accessToken)).toThrow();
  });

  it('throws TokenExpiredError when the token has expired', async () => {
    process.env.JWT_REFRESH_EXPIRES_IN = '1ms';
    const token = signRefreshToken({ userId: 'old' });
    await new Promise((r) => setTimeout(r, 10));
    expect(() => verifyRefreshToken(token)).toThrow();
    process.env.JWT_REFRESH_EXPIRES_IN = '30d';
  });
});
