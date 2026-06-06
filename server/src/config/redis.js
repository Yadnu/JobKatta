import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  retryStrategy(times) {
    if (times > 10) {
      console.error('[Redis] Max reconnection attempts reached. Giving up.');
      return null;
    }
    const delay = Math.min(times * 200, 3000);
    console.warn(`[Redis] Reconnecting in ${delay}ms (attempt ${times})…`);
    return delay;
  },
  reconnectOnError(err) {
    const targetErrors = ['READONLY', 'ECONNRESET', 'ETIMEDOUT'];
    if (targetErrors.some((e) => err.message.includes(e))) {
      return true;
    }
    return false;
  },
});

redis.on('connect', () => console.log('[Redis] Connected'));
redis.on('ready', () => console.log('[Redis] Ready'));
redis.on('error', (err) => console.error('[Redis] Error:', err.message));
redis.on('close', () => console.warn('[Redis] Connection closed'));
redis.on('reconnecting', () => console.warn('[Redis] Reconnecting…'));

export default redis;
