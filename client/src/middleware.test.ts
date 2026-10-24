import { describe, expect, it, vi, beforeEach } from 'vitest';

const { nextMock, redirectMock } = vi.hoisted(() => ({
  nextMock: vi.fn(() => ({ type: 'next' })),
  redirectMock: vi.fn((url: URL) => ({ type: 'redirect', url: url.toString() })),
}));

vi.mock('next/server', () => ({
  NextResponse: { next: nextMock, redirect: redirectMock },
}));

import { middleware } from './middleware';

const makeReq = (pathname: string, hasSessionCookie = false) =>
  ({
    nextUrl: { pathname, href: `http://localhost:3000${pathname}` },
    cookies: {
      get: (name: string) =>
        name === 'jk-has-session' && hasSessionCookie ? { value: '1' } : undefined,
    },
  }) as any;

beforeEach(() => vi.clearAllMocks());

describe('middleware', () => {
  // ─── public routes (no protection) ─────────────────────────────────────────

  it('allows requests to public routes without a session cookie', () => {
    middleware(makeReq('/auth/login'));
    expect(nextMock).toHaveBeenCalledOnce();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('allows requests to /jobs without a session cookie', () => {
    middleware(makeReq('/jobs'));
    expect(nextMock).toHaveBeenCalledOnce();
  });

  it('allows requests to the root path', () => {
    middleware(makeReq('/'));
    expect(nextMock).toHaveBeenCalledOnce();
  });

  // ─── protected routes — no cookie ──────────────────────────────────────────

  it('redirects to /auth/login when accessing /candidate/dashboard without a session', () => {
    middleware(makeReq('/candidate/dashboard'));
    expect(redirectMock).toHaveBeenCalledOnce();
    const redirectUrl: string = redirectMock.mock.calls[0][0].toString();
    expect(redirectUrl).toContain('/auth/login');
  });

  it('redirects to /auth/login when accessing /employer/jobs without a session', () => {
    middleware(makeReq('/employer/jobs'));
    expect(redirectMock).toHaveBeenCalledOnce();
  });

  it('redirects to /auth/login when accessing /admin/dashboard without a session', () => {
    middleware(makeReq('/admin/dashboard'));
    expect(redirectMock).toHaveBeenCalledOnce();
  });

  it('appends the original path as the ?next= param in the redirect URL', () => {
    middleware(makeReq('/candidate/profile'));
    const redirectUrl = redirectMock.mock.calls[0][0].toString();
    expect(redirectUrl).toContain('next=%2Fcandidate%2Fprofile');
  });

  // ─── protected routes — with valid session cookie ───────────────────────────

  it('allows access to /candidate/dashboard when session cookie is present', () => {
    middleware(makeReq('/candidate/dashboard', true));
    expect(nextMock).toHaveBeenCalledOnce();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('allows access to /employer/profile when session cookie is present', () => {
    middleware(makeReq('/employer/profile', true));
    expect(nextMock).toHaveBeenCalledOnce();
  });

  it('allows access to /admin/stats when session cookie is present', () => {
    middleware(makeReq('/admin/stats', true));
    expect(nextMock).toHaveBeenCalledOnce();
  });

  // ─── edge cases ─────────────────────────────────────────────────────────────

  it('does not redirect when cookie value is not "1"', () => {
    const req = {
      nextUrl: { pathname: '/candidate/dashboard', href: 'http://localhost:3000/candidate/dashboard' },
      cookies: { get: () => ({ value: 'true' }) },
    } as any;
    middleware(req);
    expect(redirectMock).toHaveBeenCalledOnce();
  });
});
