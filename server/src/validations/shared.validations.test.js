import { describe, expect, it } from 'vitest';
import {
  APPLICATION_STATUSES,
  EMPLOYMENT_TYPES,
  idParam,
  paginationQuery,
} from './shared.validations.js';

describe('idParam', () => {
  it('accepts a non-empty id', () => {
    expect(idParam.safeParse({ params: { id: 'job-1' } }).success).toBe(true);
  });

  it('rejects an empty id', () => {
    const result = idParam.safeParse({ params: { id: '' } });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe('ID required');
  });

  it('rejects a missing id', () => {
    expect(idParam.safeParse({ params: {} }).success).toBe(false);
  });
});

describe('paginationQuery', () => {
  it('accepts page and limit as strings', () => {
    expect(paginationQuery.safeParse({ query: { page: '2', limit: '10' } }).success).toBe(true);
  });

  it('accepts an empty query', () => {
    expect(paginationQuery.safeParse({ query: {} }).success).toBe(true);
  });

  it('rejects a numeric page', () => {
    expect(paginationQuery.safeParse({ query: { page: 2 } }).success).toBe(false);
  });
});

describe('shared enums', () => {
  it('lists the employment types used by job forms', () => {
    expect(EMPLOYMENT_TYPES).toEqual(['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'FREELANCE', 'CONTRACT']);
  });

  it('lists the application statuses in pipeline order', () => {
    expect(APPLICATION_STATUSES).toEqual([
      'APPLIED',
      'VIEWED',
      'SHORTLISTED',
      'INTERVIEWING',
      'HIRED',
      'REJECTED',
    ]);
  });
});
