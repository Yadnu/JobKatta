import { beforeEach, describe, expect, it } from 'vitest';
import { getAccessToken, getRefreshToken, setTokens, clearTokens, isTokenExpired } from './auth';

describe('auth token storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns null when no tokens are stored', () => {
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  it('sets and retrieves both tokens', () => {
    setTokens('access-abc', 'refresh-xyz');
    expect(getAccessToken()).toBe('access-abc');
    expect(getRefreshToken()).toBe('refresh-xyz');
  });

  it('overwrites existing tokens on setTokens', () => {
    setTokens('old-access', 'old-refresh');
    setTokens('new-access', 'new-refresh');
    expect(getAccessToken()).toBe('new-access');
    expect(getRefreshToken()).toBe('new-refresh');
  });

  it('removes both tokens on clearTokens', () => {
    setTokens('access-abc', 'refresh-xyz');
    clearTokens();
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  it('clearTokens is safe to call when already empty', () => {
    expect(() => clearTokens()).not.toThrow();
  });
});

function makeJwt(expSeconds: number) {
  const payload = btoa(JSON.stringify({ exp: expSeconds }));
  return `header.${payload}.signature`;
}

describe('isTokenExpired', () => {
  it('returns false for a token that is not yet expired', () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    expect(isTokenExpired(makeJwt(futureExp))).toBe(false);
  });

  it('returns true for an already-expired token', () => {
    const pastExp = Math.floor(Date.now() / 1000) - 1;
    expect(isTokenExpired(makeJwt(pastExp))).toBe(true);
  });

  it('returns true for a token with no parts', () => {
    expect(isTokenExpired('garbage')).toBe(true);
  });

  it('returns true for a token with invalid base64 payload', () => {
    expect(isTokenExpired('header.!!!.signature')).toBe(true);
  });

  it('returns true for an empty string', () => {
    expect(isTokenExpired('')).toBe(true);
  });
});
