import { describe, expect, it } from 'vitest';
import { CANDIDATE_PLANS, EMPLOYER_PLANS, getPlanByKey } from './plans.js';

describe('CANDIDATE_PLANS', () => {
  it('FREE plan has zero price', () => {
    expect(CANDIDATE_PLANS.FREE.price).toBe(0);
  });

  it('FREE plan has a limited application count', () => {
    expect(CANDIDATE_PLANS.FREE.appLimit).toBe(5);
  });

  it('PREMIUM plans have unlimited applications (appLimit = -1)', () => {
    expect(CANDIDATE_PLANS.PREMIUM_MONTHLY.appLimit).toBe(-1);
    expect(CANDIDATE_PLANS.PREMIUM_YEARLY.appLimit).toBe(-1);
  });

  it('PREMIUM_YEARLY is more expensive than PREMIUM_MONTHLY', () => {
    expect(CANDIDATE_PLANS.PREMIUM_YEARLY.price).toBeGreaterThan(CANDIDATE_PLANS.PREMIUM_MONTHLY.price);
  });

  it('PREMIUM_YEARLY has a longer duration than PREMIUM_MONTHLY', () => {
    expect(CANDIDATE_PLANS.PREMIUM_YEARLY.duration).toBeGreaterThan(CANDIDATE_PLANS.PREMIUM_MONTHLY.duration);
  });

  it('all plans have a label', () => {
    for (const plan of Object.values(CANDIDATE_PLANS)) {
      expect(typeof plan.label).toBe('string');
      expect(plan.label.length).toBeGreaterThan(0);
    }
  });
});

describe('EMPLOYER_PLANS', () => {
  it('ANNUAL supports the most active job postings', () => {
    expect(EMPLOYER_PLANS.ANNUAL.activeJobs).toBeGreaterThan(EMPLOYER_PLANS.STANDARD.activeJobs);
    expect(EMPLOYER_PLANS.STANDARD.activeJobs).toBeGreaterThan(EMPLOYER_PLANS.BASIC.activeJobs);
  });

  it('only ANNUAL plan has featured posting enabled', () => {
    expect(EMPLOYER_PLANS.ANNUAL.featured).toBe(true);
    expect(EMPLOYER_PLANS.STANDARD.featured).toBe(false);
    expect(EMPLOYER_PLANS.BASIC.featured).toBe(false);
  });

  it('STANDARD and ANNUAL have priority posting; BASIC does not', () => {
    expect(EMPLOYER_PLANS.STANDARD.priority).toBe(true);
    expect(EMPLOYER_PLANS.ANNUAL.priority).toBe(true);
    expect(EMPLOYER_PLANS.BASIC.priority).toBe(false);
  });

  it('ANNUAL has the longest duration', () => {
    expect(EMPLOYER_PLANS.ANNUAL.duration).toBeGreaterThan(EMPLOYER_PLANS.STANDARD.duration);
    expect(EMPLOYER_PLANS.ANNUAL.duration).toBeGreaterThan(EMPLOYER_PLANS.BASIC.duration);
  });

  it('all plans have a positive price', () => {
    for (const plan of Object.values(EMPLOYER_PLANS)) {
      expect(plan.price).toBeGreaterThan(0);
    }
  });
});

describe('getPlanByKey', () => {
  it('returns the correct candidate plan for each key', () => {
    expect(getPlanByKey('CANDIDATE', 'FREE')).toBe(CANDIDATE_PLANS.FREE);
    expect(getPlanByKey('CANDIDATE', 'PREMIUM_MONTHLY')).toBe(CANDIDATE_PLANS.PREMIUM_MONTHLY);
    expect(getPlanByKey('CANDIDATE', 'PREMIUM_YEARLY')).toBe(CANDIDATE_PLANS.PREMIUM_YEARLY);
  });

  it('returns the correct employer plan for each key', () => {
    expect(getPlanByKey('EMPLOYER', 'BASIC')).toBe(EMPLOYER_PLANS.BASIC);
    expect(getPlanByKey('EMPLOYER', 'STANDARD')).toBe(EMPLOYER_PLANS.STANDARD);
    expect(getPlanByKey('EMPLOYER', 'ANNUAL')).toBe(EMPLOYER_PLANS.ANNUAL);
  });

  it('returns undefined for an unknown plan key', () => {
    expect(getPlanByKey('CANDIDATE', 'NONEXISTENT')).toBeUndefined();
    expect(getPlanByKey('EMPLOYER', 'GOLD')).toBeUndefined();
  });

  it('returns null for an unknown role', () => {
    expect(getPlanByKey('ADMIN', 'FREE')).toBeNull();
    expect(getPlanByKey('UNKNOWN', 'BASIC')).toBeNull();
  });
});
