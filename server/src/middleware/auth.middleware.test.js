import { beforeEach, describe, expect, it, vi } from 'vitest';

// ─── mock jwt.util before importing the middleware ────────────────────────────
const verifyAccessTokenMock = vi.fn();
vi.mock('../utils/jwt.util.js', () => ({
  verifyAccessToken: verifyAccessTokenMock,
}));

const { authenticate, optionalAuthenticate } = await import('./auth.middleware.js');

const makeRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

// ─── authenticate ─────────────────────────────────────────────────────────────

describe('authenticate', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when no Authorization header is present', () => {
    const req = { headers: {} };
    const res = makeRes();
    const next = vi.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when header does not start with "Bearer "', () => {
    const req = { headers: { authorization: 'Token abc123' } };
    const res = makeRes();
    const next = vi.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('sets req.user and calls next() with a valid token', () => {
    verifyAccessTokenMock.mockReturnValue({ id: 'user-1', role: 'CANDIDATE' });
    const req = { headers: { authorization: 'Bearer valid.token.here' } };
    const res = makeRes();
    const next = vi.fn();

    authenticate(req, res, next);

    expect(req.user).toEqual({ id: 'user-1', role: 'CANDIDATE' });
    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 401 when verifyAccessToken throws (expired token)', () => {
    verifyAccessTokenMock.mockImplementation(() => { throw new Error('Token expired'); });
    const req = { headers: { authorization: 'Bearer expired.token' } };
    const res = makeRes();
    const next = vi.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});

// ─── optionalAuthenticate ─────────────────────────────────────────────────────

describe('optionalAuthenticate', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls next() without setting req.user when no header', () => {
    const req = { headers: {} };
    const res = makeRes();
    const next = vi.fn();

    optionalAuthenticate(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.user).toBeUndefined();
  });

  it('sets req.user and calls next() with a valid token', () => {
    verifyAccessTokenMock.mockReturnValue({ id: 'user-2', role: 'EMPLOYER' });
    const req = { headers: { authorization: 'Bearer valid.token' } };
    const res = makeRes();
    const next = vi.fn();

    optionalAuthenticate(req, res, next);

    expect(req.user).toEqual({ id: 'user-2', role: 'EMPLOYER' });
    expect(next).toHaveBeenCalledOnce();
  });

  it('still calls next() even when token is invalid (proceeds as unauthenticated)', () => {
    verifyAccessTokenMock.mockImplementation(() => { throw new Error('invalid'); });
    const req = { headers: { authorization: 'Bearer bad.token' } };
    const res = makeRes();
    const next = vi.fn();

    optionalAuthenticate(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.user).toBeUndefined();
  });
});
