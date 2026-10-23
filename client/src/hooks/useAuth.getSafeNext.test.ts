/**
 * Unit tests for the getSafeNext() open-redirect guard extracted from useAuth.ts.
 * The function is not exported, so we replicate the identical logic here to test it
 * in isolation — any change to the production implementation must be mirrored here.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

function getSafeNext(search: string): string | null {
  const next = new URLSearchParams(search).get('next');
  if (next && next.startsWith('/') && !next.startsWith('//')) return next;
  return null;
}

describe('getSafeNext', () => {
  it('returns the path when next is a valid internal route', () => {
    expect(getSafeNext('?next=/candidate/dashboard')).toBe('/candidate/dashboard');
  });

  it('returns a deeply nested internal path unchanged', () => {
    expect(getSafeNext('?next=/candidate/profile/setup')).toBe('/candidate/profile/setup');
  });

  it('preserves query params within the next path', () => {
    expect(getSafeNext('?next=/jobs?category=tech')).toBe('/jobs?category=tech');
  });

  it('returns null when next param is absent', () => {
    expect(getSafeNext('')).toBeNull();
    expect(getSafeNext('?registered=1')).toBeNull();
  });

  it('returns null for protocol-relative URLs (open-redirect guard)', () => {
    expect(getSafeNext('?next=//evil.com')).toBeNull();
    expect(getSafeNext('?next=//evil.com/phish')).toBeNull();
  });

  it('returns null for absolute http URLs', () => {
    expect(getSafeNext('?next=http://evil.com')).toBeNull();
  });

  it('returns null for absolute https URLs', () => {
    expect(getSafeNext('?next=https://evil.com')).toBeNull();
  });

  it('returns null for javascript: URLs', () => {
    expect(getSafeNext('?next=javascript:alert(1)')).toBeNull();
  });

  it('returns null for an empty next value', () => {
    expect(getSafeNext('?next=')).toBeNull();
  });
});
