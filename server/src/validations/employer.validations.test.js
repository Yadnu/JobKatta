import { describe, expect, it } from 'vitest';
import {
  createJobSchema,
  updateApplicationFollowUpSchema,
  updateApplicationNoteSchema,
  updateApplicationStatusSchema,
  updateEmployerProfileSchema,
  updateJobSchema,
} from './employer.validations.js';

const b = (body) => ({ body, query: {}, params: {} });
const bp = (body, params) => ({ body, query: {}, params });

// ─── updateEmployerProfileSchema ──────────────────────────────────────────────

describe('updateEmployerProfileSchema', () => {
  it('accepts an empty body (all fields optional)', () => {
    expect(updateEmployerProfileSchema.safeParse(b({})).success).toBe(true);
  });

  it('accepts a full valid profile update', () => {
    expect(
      updateEmployerProfileSchema.safeParse(b({
        companyName: 'Acme Corp',
        companyEmail: 'hr@acme.com',
        website: 'https://acme.com',
        city: 'Bangalore',
        state: 'Karnataka',
      })).success
    ).toBe(true);
  });

  it('rejects an invalid companyEmail', () => {
    expect(updateEmployerProfileSchema.safeParse(b({ companyEmail: 'bad' })).success).toBe(false);
  });

  it('rejects an invalid website URL', () => {
    expect(updateEmployerProfileSchema.safeParse(b({ website: 'not-a-url' })).success).toBe(false);
  });

  it('rejects foundedYear in the future', () => {
    expect(
      updateEmployerProfileSchema.safeParse(b({ foundedYear: new Date().getFullYear() + 1 })).success
    ).toBe(false);
  });

  it('rejects a description exceeding 2000 chars', () => {
    expect(updateEmployerProfileSchema.safeParse(b({ description: 'x'.repeat(2001) })).success).toBe(false);
  });
});

// ─── createJobSchema ──────────────────────────────────────────────────────────

describe('createJobSchema', () => {
  const base = {
    title: 'Senior Developer',
    category: 'Technology',
    employmentType: 'FULL_TIME',
    description: 'A'.repeat(100),
    city: 'Bangalore',
    state: 'Karnataka',
    skills: ['React', 'Node.js'],
  };

  it('accepts a valid job post', () => {
    expect(createJobSchema.safeParse(b(base)).success).toBe(true);
  });

  it('rejects a title shorter than 5 chars', () => {
    expect(createJobSchema.safeParse(b({ ...base, title: 'Dev' })).success).toBe(false);
  });

  it('rejects a description shorter than 100 chars', () => {
    expect(createJobSchema.safeParse(b({ ...base, description: 'Short' })).success).toBe(false);
  });

  it('rejects an invalid employmentType', () => {
    expect(createJobSchema.safeParse(b({ ...base, employmentType: 'GIG' })).success).toBe(false);
  });

  it('rejects an empty skills array', () => {
    expect(createJobSchema.safeParse(b({ ...base, skills: [] })).success).toBe(false);
  });

  it('rejects missing required city', () => {
    const { city: _, ...rest } = base;
    expect(createJobSchema.safeParse(b(rest)).success).toBe(false);
  });
});

// ─── updateJobSchema ──────────────────────────────────────────────────────────

describe('updateJobSchema', () => {
  it('accepts a partial update with valid id', () => {
    expect(updateJobSchema.safeParse(bp({ title: 'Updated Title' }, { id: 'job-1' })).success).toBe(true);
  });

  it('accepts an empty body (all fields optional on update)', () => {
    expect(updateJobSchema.safeParse(bp({}, { id: 'job-1' })).success).toBe(true);
  });

  it('rejects a missing id param', () => {
    expect(updateJobSchema.safeParse(bp({ title: 'X' }, {})).success).toBe(false);
  });

  it('rejects an invalid employmentType in partial update', () => {
    expect(updateJobSchema.safeParse(bp({ employmentType: 'GIG' }, { id: 'job-1' })).success).toBe(false);
  });
});

// ─── updateApplicationStatusSchema ───────────────────────────────────────────

describe('updateApplicationStatusSchema', () => {
  it('accepts each valid application status', () => {
    const statuses = ['APPLIED', 'VIEWED', 'SHORTLISTED', 'INTERVIEWING', 'HIRED', 'REJECTED'];
    statuses.forEach((status) => {
      expect(updateApplicationStatusSchema.safeParse(bp({ status }, { id: 'app-1' })).success).toBe(true);
    });
  });

  it('rejects an invalid status', () => {
    expect(updateApplicationStatusSchema.safeParse(bp({ status: 'MAYBE' }, { id: 'app-1' })).success).toBe(false);
  });

  it('rejects missing status', () => {
    expect(updateApplicationStatusSchema.safeParse(bp({}, { id: 'app-1' })).success).toBe(false);
  });

  it('rejects missing id param', () => {
    expect(updateApplicationStatusSchema.safeParse(bp({ status: 'VIEWED' }, {})).success).toBe(false);
  });
});

// ─── updateApplicationNoteSchema ──────────────────────────────────────────────

describe('updateApplicationNoteSchema', () => {
  it('accepts a note within 1000 chars', () => {
    expect(updateApplicationNoteSchema.safeParse(bp({ internalNote: 'Good candidate' }, { id: 'app-1' })).success).toBe(true);
  });

  it('rejects a note exceeding 1000 chars', () => {
    expect(
      updateApplicationNoteSchema.safeParse(bp({ internalNote: 'x'.repeat(1001) }, { id: 'app-1' })).success
    ).toBe(false);
  });

  it('rejects missing internalNote field', () => {
    expect(updateApplicationNoteSchema.safeParse(bp({}, { id: 'app-1' })).success).toBe(false);
  });
});

// ─── updateApplicationFollowUpSchema ─────────────────────────────────────────

describe('updateApplicationFollowUpSchema', () => {
  it('accepts a follow-up date string', () => {
    expect(
      updateApplicationFollowUpSchema.safeParse(bp({ followUpDate: '2024-06-01' }, { id: 'app-1' })).success
    ).toBe(true);
  });

  it('accepts an empty body (followUpDate optional — clears the date)', () => {
    expect(updateApplicationFollowUpSchema.safeParse(bp({}, { id: 'app-1' })).success).toBe(true);
  });

  it('rejects missing id param', () => {
    expect(updateApplicationFollowUpSchema.safeParse(bp({ followUpDate: '2024-06-01' }, {})).success).toBe(false);
  });
});
