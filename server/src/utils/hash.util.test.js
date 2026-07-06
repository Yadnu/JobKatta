import { describe, expect, it } from 'vitest';
import { comparePassword, compareToken, hashPassword, hashToken } from './hash.util.js';

describe('hashPassword / comparePassword', () => {
  it('hashes a password and verifies it correctly', async () => {
    const plain = 'MySecret123!';
    const hash = await hashPassword(plain);
    expect(hash).not.toBe(plain);
    await expect(comparePassword(plain, hash)).resolves.toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const hash = await hashPassword('correct-password');
    await expect(comparePassword('wrong-password', hash)).resolves.toBe(false);
  });

  it('produces unique hashes for the same input (salted)', async () => {
    const [a, b] = await Promise.all([hashPassword('same'), hashPassword('same')]);
    expect(a).not.toBe(b);
  });

  it('produces a non-empty hash string', async () => {
    const hash = await hashPassword('test');
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
  });
});

describe('hashToken / compareToken', () => {
  it('hashes a token and verifies it correctly', async () => {
    const token = 'my-email-verification-token-abc123';
    const hashed = await hashToken(token);
    await expect(compareToken(token, hashed)).resolves.toBe(true);
  });

  it('rejects an incorrect token', async () => {
    const hashed = await hashToken('correct-token');
    await expect(compareToken('wrong-token', hashed)).resolves.toBe(false);
  });

  it('produces a non-empty hash string', async () => {
    const hashed = await hashToken('some-token');
    expect(typeof hashed).toBe('string');
    expect(hashed.length).toBeGreaterThan(0);
  });
});
