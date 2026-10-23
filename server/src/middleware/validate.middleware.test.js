import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { validate } from './validate.middleware.js';

function makeRes() {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  return res;
}

const schema = z.object({
  body: z.object({
    email: z.string().email('Valid email required'),
    age: z.number().min(18, 'Must be 18 or older'),
  }),
});

describe('validate middleware', () => {
  it('calls next() and sets req.validated when input is valid', () => {
    const req = { body: { email: 'user@example.com', age: 25 }, query: {}, params: {} };
    const res = makeRes();
    const next = vi.fn();

    validate(schema)(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
    expect(req.validated).toEqual({
      body: { email: 'user@example.com', age: 25 },
    });
  });

  it('returns 422 and does not call next() when input is invalid', () => {
    const req = { body: { email: 'not-an-email', age: 25 }, query: {}, params: {} };
    const res = makeRes();
    const next = vi.fn();

    validate(schema)(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(422);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(false);
    expect(body.message).toBe('Validation failed');
    expect(body.errors).toBeInstanceOf(Array);
    expect(body.errors.length).toBeGreaterThan(0);
  });

  it('includes the field name and message in each error', () => {
    const req = { body: { email: 'bad', age: 10 }, query: {}, params: {} };
    const res = makeRes();

    validate(schema)(req, res, vi.fn());

    const errors = res.json.mock.calls[0][0].errors;
    const fields = errors.map((e) => e.field);
    expect(fields).toContain('email');
    expect(fields).toContain('age');
    errors.forEach((e) => {
      expect(typeof e.message).toBe('string');
      expect(e.message.length).toBeGreaterThan(0);
    });
  });

  it('reports the correct custom error message', () => {
    const req = { body: { email: 'bad', age: 25 }, query: {}, params: {} };
    const res = makeRes();

    validate(schema)(req, res, vi.fn());

    const errors = res.json.mock.calls[0][0].errors;
    const emailError = errors.find((e) => e.field === 'email');
    expect(emailError?.message).toBe('Valid email required');
  });

  it('validates query params when the schema defines them', () => {
    const querySchema = z.object({
      query: z.object({ token: z.string().min(1, 'Token required') }),
    });
    const req = { body: {}, query: { token: '' }, params: {} };
    const res = makeRes();
    const next = vi.fn();

    validate(querySchema)(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(422);
  });

  it('passes when query param is valid', () => {
    const querySchema = z.object({
      query: z.object({ token: z.string().min(1) }),
    });
    const req = { body: {}, query: { token: 'abc123' }, params: {} };
    const res = makeRes();
    const next = vi.fn();

    validate(querySchema)(req, res, next);

    expect(next).toHaveBeenCalledOnce();
  });

  it('returns 422 for a missing required body field', () => {
    const req = { body: { age: 25 }, query: {}, params: {} };
    const res = makeRes();

    validate(schema)(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(422);
    const errors = res.json.mock.calls[0][0].errors;
    expect(errors.some((e) => e.field === 'email')).toBe(true);
  });
});
