import { describe, expect, it, vi } from 'vitest';
import { requireRole, requireAdmin, requireCandidate, requireEmployer } from './role.middleware.js';

const makeRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

// ─── requireRole ──────────────────────────────────────────────────────────────

describe('requireRole', () => {
  it('returns 401 when req.user is absent', () => {
    const req = {};
    const res = makeRes();
    const next = vi.fn();

    requireRole('ADMIN')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 when the user role does not match', () => {
    const req = { user: { id: '1', role: 'CANDIDATE' } };
    const res = makeRes();
    const next = vi.fn();

    requireRole('ADMIN')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next() when the role matches', () => {
    const req = { user: { id: '1', role: 'EMPLOYER' } };
    const res = makeRes();
    const next = vi.fn();

    requireRole('EMPLOYER')(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('calls next() when the role is one of multiple allowed roles', () => {
    const req = { user: { id: '1', role: 'EMPLOYER' } };
    const res = makeRes();
    const next = vi.fn();

    requireRole('CANDIDATE', 'EMPLOYER')(req, res, next);

    expect(next).toHaveBeenCalledOnce();
  });
});

// ─── role shortcuts ───────────────────────────────────────────────────────────

describe('requireAdmin', () => {
  it('allows ADMIN role', () => {
    const req = { user: { role: 'ADMIN' } };
    const res = makeRes();
    const next = vi.fn();
    requireAdmin(req, res, next);
    expect(next).toHaveBeenCalledOnce();
  });

  it('blocks CANDIDATE role with 403', () => {
    const req = { user: { role: 'CANDIDATE' } };
    const res = makeRes();
    const next = vi.fn();
    requireAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});

describe('requireCandidate', () => {
  it('allows CANDIDATE role', () => {
    const req = { user: { role: 'CANDIDATE' } };
    const res = makeRes();
    const next = vi.fn();
    requireCandidate(req, res, next);
    expect(next).toHaveBeenCalledOnce();
  });

  it('blocks EMPLOYER role with 403', () => {
    const req = { user: { role: 'EMPLOYER' } };
    const res = makeRes();
    const next = vi.fn();
    requireCandidate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});

describe('requireEmployer', () => {
  it('allows EMPLOYER role', () => {
    const req = { user: { role: 'EMPLOYER' } };
    const res = makeRes();
    const next = vi.fn();
    requireEmployer(req, res, next);
    expect(next).toHaveBeenCalledOnce();
  });

  it('blocks ADMIN role with 403', () => {
    const req = { user: { role: 'ADMIN' } };
    const res = makeRes();
    const next = vi.fn();
    requireEmployer(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
