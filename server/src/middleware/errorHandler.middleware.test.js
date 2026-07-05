import { describe, expect, it, vi } from 'vitest';
import {
  AppError,
  catchAsync,
  errorHandler,
  notFound,
} from './errorHandler.middleware.js';

// ─── AppError ─────────────────────────────────────────────────────────────────

describe('AppError', () => {
  it('extends the native Error class', () => {
    const err = new AppError('Not found', 404);
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
  });

  it('stores message, statusCode, errors, and isOperational', () => {
    const err = new AppError('Bad request', 400, [{ field: 'email' }]);
    expect(err.message).toBe('Bad request');
    expect(err.statusCode).toBe(400);
    expect(err.errors).toEqual([{ field: 'email' }]);
    expect(err.isOperational).toBe(true);
  });

  it('defaults statusCode to 500', () => {
    expect(new AppError('Oops').statusCode).toBe(500);
  });

  it('defaults errors to an empty array', () => {
    expect(new AppError('Oops').errors).toEqual([]);
  });
});

// ─── catchAsync ───────────────────────────────────────────────────────────────

describe('catchAsync', () => {
  it('calls next with the error when the handler rejects', async () => {
    const error = new Error('async failure');
    const handler = catchAsync(async () => { throw error; });
    const next = vi.fn();
    handler({}, {}, next);
    await new Promise((r) => setTimeout(r, 0));
    expect(next).toHaveBeenCalledWith(error);
  });

  it('does not call next when the handler resolves', async () => {
    const res = { send: vi.fn() };
    const handler = catchAsync(async (_req, res) => { res.send('ok'); });
    const next = vi.fn();
    handler({}, res, next);
    await new Promise((r) => setTimeout(r, 0));
    expect(next).not.toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith('ok');
  });

  it('passes req, res, next through to the handler', async () => {
    const innerFn = vi.fn().mockResolvedValue(undefined);
    const handler = catchAsync(innerFn);
    const req = { id: 1 };
    const res = { id: 2 };
    const next = vi.fn();
    handler(req, res, next);
    await new Promise((r) => setTimeout(r, 0));
    expect(innerFn).toHaveBeenCalledWith(req, res, next);
  });
});

// ─── errorHandler ─────────────────────────────────────────────────────────────

function makeRes() {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  return res;
}

describe('errorHandler', () => {
  it('responds with operational error message and statusCode', () => {
    const err = new AppError('Not found', 404);
    const res = makeRes();
    errorHandler(err, {}, res, () => {});
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Not found', errors: [] });
  });

  it('masks non-operational errors with a generic message', () => {
    const err = new Error('Raw DB crash');
    const res = makeRes();
    errorHandler(err, {}, res, () => {});
    expect(res.status).toHaveBeenCalledWith(500);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(false);
    expect(body.message).toBe('An unexpected error occurred');
  });

  it('includes the errors array from AppError in the response body', () => {
    const err = new AppError('Validation failed', 422, [{ field: 'email', msg: 'Invalid' }]);
    const res = makeRes();
    errorHandler(err, {}, res, () => {});
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Validation failed',
      errors: [{ field: 'email', msg: 'Invalid' }],
    });
  });

  it('falls back to statusCode 500 for plain errors', () => {
    const err = new Error('Something broke');
    const res = makeRes();
    errorHandler(err, {}, res, () => {});
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─── notFound ─────────────────────────────────────────────────────────────────

describe('notFound', () => {
  it('returns 404 with the requested URL in the message', () => {
    const req = { originalUrl: '/api/does-not-exist' };
    const res = makeRes();
    notFound(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Route /api/does-not-exist not found',
    });
  });
});
