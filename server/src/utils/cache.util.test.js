import { beforeEach, describe, expect, it, vi } from 'vitest';

// ─── mock redis ───────────────────────────────────────────────────────────────
const redisMock = {
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  scan: vi.fn(),
};
vi.mock('../config/redis.js', () => ({ default: redisMock }));

const { getCache, setCache, deleteCache, deleteCachePattern } = await import('./cache.util.js');

beforeEach(() => vi.clearAllMocks());

// ─── getCache ─────────────────────────────────────────────────────────────────

describe('getCache', () => {
  it('returns the parsed value on a cache hit', async () => {
    redisMock.get.mockResolvedValue(JSON.stringify({ foo: 'bar' }));
    const result = await getCache('jobs:list:abc');
    expect(result).toEqual({ foo: 'bar' });
  });

  it('returns null on a cache miss', async () => {
    redisMock.get.mockResolvedValue(null);
    const result = await getCache('missing:key');
    expect(result).toBeNull();
  });

  it('returns null and does not throw when Redis errors', async () => {
    redisMock.get.mockRejectedValue(new Error('Redis down'));
    const result = await getCache('any:key');
    expect(result).toBeNull();
  });

  it('returns a primitive value (string) correctly', async () => {
    redisMock.get.mockResolvedValue(JSON.stringify('hello'));
    expect(await getCache('str:key')).toBe('hello');
  });
});

// ─── setCache ─────────────────────────────────────────────────────────────────

describe('setCache', () => {
  it('calls redis.set with JSON-serialised value and default TTL of 300', async () => {
    redisMock.set.mockResolvedValue('OK');
    await setCache('skills:all', ['React', 'Node']);
    expect(redisMock.set).toHaveBeenCalledWith('skills:all', JSON.stringify(['React', 'Node']), 'EX', 300);
  });

  it('uses a custom TTL when provided', async () => {
    redisMock.set.mockResolvedValue('OK');
    await setCache('admin:stats', { total: 5 }, 600);
    expect(redisMock.set).toHaveBeenCalledWith('admin:stats', JSON.stringify({ total: 5 }), 'EX', 600);
  });

  it('does not throw when Redis errors', async () => {
    redisMock.set.mockRejectedValue(new Error('Redis down'));
    await expect(setCache('any', 'value')).resolves.toBeUndefined();
  });
});

// ─── deleteCache ──────────────────────────────────────────────────────────────

describe('deleteCache', () => {
  it('calls redis.del with the given key', async () => {
    redisMock.del.mockResolvedValue(1);
    await deleteCache('jobs:detail:123');
    expect(redisMock.del).toHaveBeenCalledWith('jobs:detail:123');
  });

  it('does not throw when Redis errors', async () => {
    redisMock.del.mockRejectedValue(new Error('Redis down'));
    await expect(deleteCache('any:key')).resolves.toBeUndefined();
  });
});

// ─── deleteCachePattern ───────────────────────────────────────────────────────

describe('deleteCachePattern', () => {
  it('deletes keys found in a single SCAN pass', async () => {
    redisMock.scan.mockResolvedValueOnce(['0', ['jobs:list:a', 'jobs:list:b']]);
    redisMock.del.mockResolvedValue(2);

    await deleteCachePattern('jobs:list:*');

    expect(redisMock.scan).toHaveBeenCalledWith('0', 'MATCH', 'jobs:list:*', 'COUNT', 100);
    expect(redisMock.del).toHaveBeenCalledWith('jobs:list:a', 'jobs:list:b');
  });

  it('skips calling del when SCAN returns no keys', async () => {
    redisMock.scan.mockResolvedValueOnce(['0', []]);

    await deleteCachePattern('jobs:list:*');

    expect(redisMock.del).not.toHaveBeenCalled();
  });

  it('iterates through multiple SCAN cursors until cursor is "0"', async () => {
    redisMock.scan
      .mockResolvedValueOnce(['42', ['key:1']])
      .mockResolvedValueOnce(['0', ['key:2']]);
    redisMock.del.mockResolvedValue(1);

    await deleteCachePattern('key:*');

    expect(redisMock.scan).toHaveBeenCalledTimes(2);
    expect(redisMock.del).toHaveBeenCalledTimes(2);
  });

  it('does not throw when Redis errors', async () => {
    redisMock.scan.mockRejectedValue(new Error('Redis down'));
    await expect(deleteCachePattern('any:*')).resolves.toBeUndefined();
  });
});
