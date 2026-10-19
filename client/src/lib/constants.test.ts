import { describe, expect, it } from 'vitest';
import {
  JOB_CATEGORIES,
  EMPLOYMENT_TYPES,
  INDIAN_STATES,
  APPLICATION_STATUS_COLORS,
  APPLICATION_STATUS_LABELS,
  SHIFT_TIMINGS,
  COMPANY_SIZES,
  CANDIDATE_FREE_APP_LIMIT,
} from './constants';

describe('constants', () => {
  describe('JOB_CATEGORIES', () => {
    it('is a non-empty array of strings', () => {
      expect(Array.isArray(JOB_CATEGORIES)).toBe(true);
      expect(JOB_CATEGORIES.length).toBeGreaterThan(0);
      JOB_CATEGORIES.forEach((c) => expect(typeof c).toBe('string'));
    });

    it('contains "IT / Software" and "Other"', () => {
      expect(JOB_CATEGORIES).toContain('IT / Software');
      expect(JOB_CATEGORIES).toContain('Other');
    });
  });

  describe('EMPLOYMENT_TYPES', () => {
    it('contains objects with value and label keys', () => {
      EMPLOYMENT_TYPES.forEach((t) => {
        expect(t).toHaveProperty('value');
        expect(t).toHaveProperty('label');
      });
    });

    it('includes FULL_TIME and PART_TIME entries', () => {
      const values = EMPLOYMENT_TYPES.map((t) => t.value);
      expect(values).toContain('FULL_TIME');
      expect(values).toContain('PART_TIME');
    });
  });

  describe('INDIAN_STATES', () => {
    it('contains at least 28 entries (28 states + 8 UTs)', () => {
      expect(INDIAN_STATES.length).toBeGreaterThanOrEqual(28);
    });

    it('contains Maharashtra and Delhi', () => {
      expect(INDIAN_STATES).toContain('Maharashtra');
      expect(INDIAN_STATES).toContain('Delhi');
    });
  });

  describe('APPLICATION_STATUS_COLORS', () => {
    const expectedStatuses = ['APPLIED', 'VIEWED', 'SHORTLISTED', 'INTERVIEWING', 'HIRED', 'REJECTED'];

    it('has an entry for every application status', () => {
      expectedStatuses.forEach((s) => {
        expect(APPLICATION_STATUS_COLORS).toHaveProperty(s);
      });
    });

    it('all color values are non-empty strings', () => {
      Object.values(APPLICATION_STATUS_COLORS).forEach((v) => {
        expect(typeof v).toBe('string');
        expect(v.length).toBeGreaterThan(0);
      });
    });
  });

  describe('APPLICATION_STATUS_LABELS', () => {
    it('HIRED label is "Hired"', () => {
      expect(APPLICATION_STATUS_LABELS.HIRED).toBe('Hired');
    });

    it('REJECTED label is "Rejected"', () => {
      expect(APPLICATION_STATUS_LABELS.REJECTED).toBe('Rejected');
    });
  });

  describe('SHIFT_TIMINGS', () => {
    it('includes Flexible and Morning', () => {
      expect(SHIFT_TIMINGS).toContain('Flexible');
      expect(SHIFT_TIMINGS).toContain('Morning');
    });
  });

  describe('COMPANY_SIZES', () => {
    it('is a non-empty array', () => {
      expect(COMPANY_SIZES.length).toBeGreaterThan(0);
    });
  });

  describe('CANDIDATE_FREE_APP_LIMIT', () => {
    it('is 5', () => {
      expect(CANDIDATE_FREE_APP_LIMIT).toBe(5);
    });
  });
});
