import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { PrismaClientMock } = vi.hoisted(() => {
  function PrismaClient(options) {
    this.options = options;
  }
  return { PrismaClientMock: vi.fn(PrismaClient) };
});

vi.mock('@prisma/client', () => ({
  PrismaClient: PrismaClientMock,
}));

const originalEnv = process.env.NODE_ENV;

const load = async (nodeEnv) => {
  vi.resetModules();
  process.env.NODE_ENV = nodeEnv;
  delete globalThis.prisma;
  return import('./database.js');
};

beforeEach(() => {
  vi.clearAllMocks();
  delete globalThis.prisma;
});

afterEach(() => {
  process.env.NODE_ENV = originalEnv;
  delete globalThis.prisma;
});

describe('database client', () => {
  it('logs errors and warnings in development and reuses the client', async () => {
    const db = (await load('development')).default;
    expect(PrismaClientMock).toHaveBeenCalledWith({ log: ['error', 'warn'] });
    expect(globalThis.prisma).toBe(db);
  });

  it('logs only errors outside development', async () => {
    await load('test');
    expect(PrismaClientMock).toHaveBeenCalledWith({ log: ['error'] });
  });

  it('does not store the client on the global object in production', async () => {
    const db = (await load('production')).default;
    expect(PrismaClientMock).toHaveBeenCalledWith({ log: ['error'] });
    expect(db).toBeInstanceOf(PrismaClientMock);
    expect(globalThis.prisma).toBeUndefined();
  });

  it('reuses an existing global client instead of creating another', async () => {
    const existing = { existing: true };
    globalThis.prisma = existing;
    vi.resetModules();
    process.env.NODE_ENV = 'development';
    const db = (await import('./database.js')).default;
    expect(db).toBe(existing);
    expect(PrismaClientMock).not.toHaveBeenCalled();
  });
});
