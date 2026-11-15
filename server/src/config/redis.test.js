import { beforeEach, describe, expect, it, vi } from 'vitest';

const { RedisMock } = vi.hoisted(() => {
  function Redis(url, options) {
    this.url = url;
    this.options = options;
    this.handlers = {};
    this.on = (event, handler) => {
      this.handlers[event] = handler;
      return this;
    };
  }
  const RedisMock = vi.fn(Redis);
  return { RedisMock };
});

vi.mock('ioredis', () => ({ default: RedisMock }));

const load = async (url) => {
  vi.resetModules();
  if (url === undefined) delete process.env.REDIS_URL;
  else process.env.REDIS_URL = url;
  return import('./redis.js');
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('redis client', () => {
  it('connects to REDIS_URL with a bounded retry policy', async () => {
    await load('redis://cache:6379');
    expect(RedisMock).toHaveBeenCalledWith('redis://cache:6379', expect.objectContaining({
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
    }));
  });

  it('falls back to localhost when REDIS_URL is unset', async () => {
    await load(undefined);
    expect(RedisMock).toHaveBeenCalledWith('redis://localhost:6379', expect.any(Object));
  });

  it('backs off on reconnect and stops after 10 attempts', async () => {
    await load('redis://cache:6379');
    const { retryStrategy } = RedisMock.mock.calls[0][1];

    expect(retryStrategy(1)).toBe(200);
    expect(retryStrategy(10)).toBe(2000);
    expect(console.warn).toHaveBeenCalledWith('[Redis] Reconnecting in 200ms (attempt 1)…');

    expect(retryStrategy(11)).toBeNull();
    expect(console.error).toHaveBeenCalledWith('[Redis] Max reconnection attempts reached. Giving up.');
  });

  it('reconnects only for readonly, reset, and timeout errors', async () => {
    await load('redis://cache:6379');
    const { reconnectOnError } = RedisMock.mock.calls[0][1];

    expect(reconnectOnError(new Error('READONLY you can\'t write'))).toBe(true);
    expect(reconnectOnError(new Error('read ECONNRESET'))).toBe(true);
    expect(reconnectOnError(new Error('connect ETIMEDOUT'))).toBe(true);
    expect(reconnectOnError(new Error('WRONGPASS'))).toBe(false);
  });

  it('logs connection lifecycle events', async () => {
    const redis = (await load('redis://cache:6379')).default;
    redis.handlers.connect();
    redis.handlers.ready();
    redis.handlers.error(new Error('boom'));
    redis.handlers.close();
    redis.handlers.reconnecting();

    expect(console.log).toHaveBeenCalledWith('[Redis] Connected');
    expect(console.log).toHaveBeenCalledWith('[Redis] Ready');
    expect(console.error).toHaveBeenCalledWith('[Redis] Error:', 'boom');
    expect(console.warn).toHaveBeenCalledWith('[Redis] Connection closed');
    expect(console.warn).toHaveBeenCalledWith('[Redis] Reconnecting…');
  });
});
