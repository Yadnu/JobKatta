import { describe, expect, it } from 'vitest';
import { applyJobSchema, listJobsSchema, listPublicEmployersSchema } from './jobs.validations.js';
import { idParam } from './shared.validations.js';

const b = (body, params = {}) => ({ body, query: {}, params });
const q = (query) => ({ body: {}, query, params: {} });
const p = (params) => ({ body: {}, query: {}, params });

// ─── listJobsSchema ───────────────────────────────────────────────────────────

describe('listJobsSchema', () => {
  it('accepts an empty query (all optional)', () => {
    expect(listJobsSchema.safeParse(q({})).success).toBe(true);
  });

  it('accepts valid filter params', () => {
    expect(
      listJobsSchema.safeParse(q({ keyword: 'developer', city: 'Mumbai', type: 'FULL_TIME', page: '1', limit: '10' })).success
    ).toBe(true);
  });

  it('rejects an invalid employment type', () => {
    expect(listJobsSchema.safeParse(q({ type: 'GIG' })).success).toBe(false);
  });

  it('rejects a keyword longer than 200 chars', () => {
    expect(listJobsSchema.safeParse(q({ keyword: 'a'.repeat(201) })).success).toBe(false);
  });
});

// ─── listPublicEmployersSchema ────────────────────────────────────────────────

describe('listPublicEmployersSchema', () => {
  it('accepts an empty query', () => {
    expect(listPublicEmployersSchema.safeParse(q({})).success).toBe(true);
  });

  it('accepts keyword and industry filters', () => {
    expect(listPublicEmployersSchema.safeParse(q({ keyword: 'tech', industry: 'IT' })).success).toBe(true);
  });

  it('rejects a keyword exceeding 200 chars', () => {
    expect(listPublicEmployersSchema.safeParse(q({ keyword: 'x'.repeat(201) })).success).toBe(false);
  });
});

// ─── idParam ──────────────────────────────────────────────────────────────────

describe('idParam', () => {
  it('accepts a non-empty id', () => {
    expect(idParam.safeParse(p({ id: 'abc-123' })).success).toBe(true);
  });

  it('rejects an empty id', () => {
    expect(idParam.safeParse(p({ id: '' })).success).toBe(false);
  });

  it('rejects a missing id', () => {
    expect(idParam.safeParse(p({})).success).toBe(false);
  });
});

// ─── applyJobSchema ───────────────────────────────────────────────────────────

describe('applyJobSchema', () => {
  it('accepts a valid job id with no cover note', () => {
    expect(applyJobSchema.safeParse({ body: {}, query: {}, params: { id: 'job-1' } }).success).toBe(true);
  });

  it('accepts a cover note within 1000 chars', () => {
    expect(
      applyJobSchema.safeParse({ body: { coverNote: 'I am a great fit.' }, query: {}, params: { id: 'job-1' } }).success
    ).toBe(true);
  });

  it('rejects a cover note exceeding 1000 chars', () => {
    expect(
      applyJobSchema.safeParse({ body: { coverNote: 'x'.repeat(1001) }, query: {}, params: { id: 'job-1' } }).success
    ).toBe(false);
  });

  it('rejects a missing job id', () => {
    expect(applyJobSchema.safeParse({ body: {}, query: {}, params: { id: '' } }).success).toBe(false);
  });
});
