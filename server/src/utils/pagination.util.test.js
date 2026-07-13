import { describe, expect, it } from 'vitest';
import { buildPaginationMeta, parsePagination } from './pagination.util.js';

describe('parsePagination', () => {
  it('defaults to page 1, limit 10, skip 0', () => {
    expect(parsePagination({})).toEqual({ page: 1, limit: 10, skip: 0 });
  });

  it('parses valid page and limit strings', () => {
    expect(parsePagination({ page: '3', limit: '20' })).toEqual({ page: 3, limit: 20, skip: 40 });
  });

  it('computes skip as (page - 1) * limit', () => {
    expect(parsePagination({ page: '4', limit: '15' }).skip).toBe(45);
  });

  it('clamps page to minimum 1 for zero input', () => {
    expect(parsePagination({ page: '0' }).page).toBe(1);
  });

  it('clamps page to minimum 1 for negative input', () => {
    expect(parsePagination({ page: '-5' }).page).toBe(1);
  });

  it('clamps negative limit to minimum 1', () => {
    expect(parsePagination({ limit: '-10' }).limit).toBe(1);
  });

  it('falls back to default limit of 10 when limit is 0 (falsy coercion)', () => {
    // parseInt('0') is falsy, so the || 10 default kicks in before Math.max
    expect(parsePagination({ limit: '0' }).limit).toBe(10);
  });

  it('clamps limit to maximum 50', () => {
    expect(parsePagination({ limit: '200' }).limit).toBe(50);
    expect(parsePagination({ limit: '51' }).limit).toBe(50);
  });

  it('handles non-numeric strings by falling back to defaults', () => {
    expect(parsePagination({ page: 'abc', limit: 'xyz' })).toEqual({ page: 1, limit: 10, skip: 0 });
  });

  it('handles undefined values by falling back to defaults', () => {
    expect(parsePagination({ page: undefined, limit: undefined })).toEqual({ page: 1, limit: 10, skip: 0 });
  });
});

describe('buildPaginationMeta', () => {
  it('builds correct metadata for a standard scenario', () => {
    expect(buildPaginationMeta(1, 10, 25)).toEqual({ page: 1, limit: 10, total: 25, pages: 3 });
  });

  it('rounds up partial pages', () => {
    expect(buildPaginationMeta(1, 10, 21).pages).toBe(3);
    expect(buildPaginationMeta(1, 10, 11).pages).toBe(2);
  });

  it('returns 1 page when total equals limit exactly', () => {
    expect(buildPaginationMeta(1, 10, 10).pages).toBe(1);
  });

  it('returns 0 pages when total is 0', () => {
    expect(buildPaginationMeta(1, 10, 0).pages).toBe(0);
  });

  it('reflects the page and limit in the output unchanged', () => {
    const meta = buildPaginationMeta(5, 20, 100);
    expect(meta.page).toBe(5);
    expect(meta.limit).toBe(20);
  });
});
