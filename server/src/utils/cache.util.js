/**
 * Cache utility — all Redis access goes through here, never directly in controllers.
 *
 * Cache key reference:
 * ┌──────────────────────┬────────────────────────────┬────────┐
 * │ Data                 │ Key Pattern                │ TTL    │
 * ├──────────────────────┼────────────────────────────┼────────┤
 * │ Public job listings  │ jobs:list:<queryHash>      │  5 min │
 * │ Single job detail    │ jobs:detail:<jobId>        │ 10 min │
 * │ Featured jobs        │ jobs:featured              │ 15 min │
 * │ Skills list          │ skills:all                 │ 24 hr  │
 * │ Employer analytics   │ analytics:job:<jobId>      │ 10 min │
 * │ Admin dashboard stats│ admin:stats                │  5 min │
 * └──────────────────────┴────────────────────────────┴────────┘
 *
 * Invalidation events:
 *  - Job approved/rejected/expired/closed → delete jobs:list:*, jobs:featured, jobs:detail:<id>
 *  - Job edited                           → delete jobs:detail:<id>, jobs:list:*
 *  - Application submitted                → delete jobs:detail:<id>, analytics:job:<id>
 *  - New user or payment                  → delete admin:stats
 *
 * Pattern deletes use Redis SCAN, never KEYS *.
 */

import redis from '../config/redis.js';

/**
 * Read a cached value. Returns the parsed object/primitive, or null on miss or error.
 * @param {string} key
 * @returns {Promise<any|null>}
 */
export const getCache = async (key) => {
  try {
    const raw = await redis.get(key);
    if (raw === null) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`[Cache] getCache error for key "${key}":`, err.message);
    return null;
  }
};

/**
 * Write a value to the cache.
 * @param {string} key
 * @param {any} value  — will be JSON-serialised
 * @param {number} [ttlSeconds=300]
 * @returns {Promise<void>}
 */
export const setCache = async (key, value, ttlSeconds = 300) => {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch (err) {
    console.error(`[Cache] setCache error for key "${key}":`, err.message);
  }
};

/**
 * Delete a single cache key.
 * @param {string} key
 * @returns {Promise<void>}
 */
export const deleteCache = async (key) => {
  try {
    await redis.del(key);
  } catch (err) {
    console.error(`[Cache] deleteCache error for key "${key}":`, err.message);
  }
};

/**
 * Delete all keys matching a glob pattern using SCAN (safe for production).
 * Never uses KEYS * to avoid blocking the Redis event loop.
 * @param {string} pattern  e.g. "jobs:list:*"
 * @returns {Promise<void>}
 */
export const deleteCachePattern = async (pattern) => {
  try {
    let cursor = '0';
    do {
      const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== '0');
  } catch (err) {
    console.error(`[Cache] deleteCachePattern error for pattern "${pattern}":`, err.message);
  }
};
