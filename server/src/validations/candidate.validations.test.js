import { describe, expect, it } from 'vitest';
import {
  addEducationSchema,
  addExperienceSchema,
  createAlertSchema,
  updateAlertSchema,
  updateCandidateProfileSchema,
  updateEducationSchema,
  updateExperienceSchema,
  updatePreferencesSchema,
  updateSkillsSchema,
} from './candidate.validations.js';

const b = (body) => ({ body, query: {}, params: {} });
const bp = (body, params) => ({ body, query: {}, params });

// ─── updateCandidateProfileSchema ─────────────────────────────────────────────

describe('updateCandidateProfileSchema', () => {
  it('accepts an empty body (all fields optional)', () => {
    expect(updateCandidateProfileSchema.safeParse(b({})).success).toBe(true);
  });

  it('accepts a valid full profile update', () => {
    expect(
      updateCandidateProfileSchema.safeParse(b({
        firstName: 'John', lastName: 'Doe', city: 'Mumbai', state: 'Maharashtra',
        isFresher: false, totalExperienceYrs: 3, openToWork: true,
      })).success
    ).toBe(true);
  });

  it('rejects an invalid gender value', () => {
    expect(updateCandidateProfileSchema.safeParse(b({ gender: 'Unknown' })).success).toBe(false);
  });

  it('rejects an invalid mobile number', () => {
    expect(updateCandidateProfileSchema.safeParse(b({ mobile: '1234567890' })).success).toBe(false);
  });

  it('rejects a malformed email', () => {
    expect(updateCandidateProfileSchema.safeParse(b({ email: 'bad' })).success).toBe(false);
  });

  it('rejects a pincode with wrong length', () => {
    expect(updateCandidateProfileSchema.safeParse(b({ pincode: '1234' })).success).toBe(false);
  });

  it('rejects a non-numeric pincode', () => {
    expect(updateCandidateProfileSchema.safeParse(b({ pincode: 'ABCDEF' })).success).toBe(false);
  });

  it('rejects totalExperienceYrs above 60', () => {
    expect(updateCandidateProfileSchema.safeParse(b({ totalExperienceYrs: 61 })).success).toBe(false);
  });
});

// ─── addEducationSchema ───────────────────────────────────────────────────────

describe('addEducationSchema', () => {
  const base = { degree: 'BSc', institution: 'MIT', startYear: 2018, isCurrently: false };

  it('accepts a valid education entry', () => {
    expect(addEducationSchema.safeParse(b(base)).success).toBe(true);
  });

  it('rejects missing degree', () => {
    const { degree: _, ...rest } = base;
    expect(addEducationSchema.safeParse(b(rest)).success).toBe(false);
  });

  it('rejects percentage above 100', () => {
    expect(addEducationSchema.safeParse(b({ ...base, percentage: 110 })).success).toBe(false);
  });

  it('rejects startYear before 1980', () => {
    expect(addEducationSchema.safeParse(b({ ...base, startYear: 1979 })).success).toBe(false);
  });
});

// ─── updateEducationSchema ────────────────────────────────────────────────────

describe('updateEducationSchema', () => {
  it('accepts a partial update with a valid id param', () => {
    expect(updateEducationSchema.safeParse(bp({ degree: 'MSc' }, { id: 'edu-1' })).success).toBe(true);
  });

  it('rejects a missing id param', () => {
    expect(updateEducationSchema.safeParse(bp({ degree: 'MSc' }, {})).success).toBe(false);
  });
});

// ─── addExperienceSchema ──────────────────────────────────────────────────────

describe('addExperienceSchema', () => {
  const base = { jobTitle: 'Engineer', companyName: 'Acme', startDate: '2021-01-01', isCurrent: false };

  it('accepts a valid experience entry', () => {
    expect(addExperienceSchema.safeParse(b(base)).success).toBe(true);
  });

  it('rejects a jobTitle shorter than 2 characters', () => {
    expect(addExperienceSchema.safeParse(b({ ...base, jobTitle: 'E' })).success).toBe(false);
  });

  it('rejects an invalid employmentType', () => {
    expect(addExperienceSchema.safeParse(b({ ...base, employmentType: 'GIG' })).success).toBe(false);
  });

  it('rejects a description exceeding 1000 chars', () => {
    expect(addExperienceSchema.safeParse(b({ ...base, description: 'x'.repeat(1001) })).success).toBe(false);
  });
});

// ─── updateExperienceSchema ───────────────────────────────────────────────────

describe('updateExperienceSchema', () => {
  it('accepts a partial update with a valid id param', () => {
    expect(updateExperienceSchema.safeParse(bp({ jobTitle: 'Senior Eng' }, { id: 'exp-1' })).success).toBe(true);
  });

  it('rejects missing id param', () => {
    expect(updateExperienceSchema.safeParse(bp({ jobTitle: 'X' }, {})).success).toBe(false);
  });
});

// ─── updateSkillsSchema ───────────────────────────────────────────────────────

describe('updateSkillsSchema', () => {
  it('accepts a non-empty skillIds array', () => {
    expect(updateSkillsSchema.safeParse(b({ skillIds: ['s1', 's2'] })).success).toBe(true);
  });

  it('rejects an empty skillIds array', () => {
    expect(updateSkillsSchema.safeParse(b({ skillIds: [] })).success).toBe(false);
  });

  it('rejects missing skillIds field', () => {
    expect(updateSkillsSchema.safeParse(b({})).success).toBe(false);
  });
});

// ─── updatePreferencesSchema ──────────────────────────────────────────────────

describe('updatePreferencesSchema', () => {
  it('accepts an empty body (all optional)', () => {
    expect(updatePreferencesSchema.safeParse(b({})).success).toBe(true);
  });

  it('rejects negative expectedSalaryMin', () => {
    expect(updatePreferencesSchema.safeParse(b({ expectedSalaryMin: -1 })).success).toBe(false);
  });

  it('rejects preferredRoles exceeding 200 chars', () => {
    expect(updatePreferencesSchema.safeParse(b({ preferredRoles: 'x'.repeat(201) })).success).toBe(false);
  });
});

// ─── createAlertSchema ────────────────────────────────────────────────────────

describe('createAlertSchema', () => {
  it('accepts a valid alert with keywords only', () => {
    expect(createAlertSchema.safeParse(b({ keywords: 'React developer' })).success).toBe(true);
  });

  it('accepts optional city and jobType', () => {
    expect(createAlertSchema.safeParse(b({ keywords: 'React', city: 'Pune', jobType: 'FULL_TIME' })).success).toBe(true);
  });

  it('rejects missing keywords', () => {
    expect(createAlertSchema.safeParse(b({})).success).toBe(false);
  });

  it('rejects an invalid jobType', () => {
    expect(createAlertSchema.safeParse(b({ keywords: 'dev', jobType: 'GIG' })).success).toBe(false);
  });

  it('rejects keywords exceeding 200 chars', () => {
    expect(createAlertSchema.safeParse(b({ keywords: 'x'.repeat(201) })).success).toBe(false);
  });
});

// ─── updateAlertSchema ────────────────────────────────────────────────────────

describe('updateAlertSchema', () => {
  it('accepts a partial update with valid id', () => {
    expect(updateAlertSchema.safeParse(bp({ isActive: false }, { id: 'alert-1' })).success).toBe(true);
  });

  it('rejects missing id', () => {
    expect(updateAlertSchema.safeParse(bp({ isActive: true }, {})).success).toBe(false);
  });

  it('rejects an invalid jobType in update', () => {
    expect(updateAlertSchema.safeParse(bp({ jobType: 'GIG' }, { id: 'a1' })).success).toBe(false);
  });
});
