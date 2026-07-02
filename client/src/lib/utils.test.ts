import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  cn,
  employmentTypeLabel,
  formatDate,
  formatINR,
  formatSalaryRange,
  getInitials,
  timeAgo,
  truncate,
} from './utils';

describe('cn', () => {
  it('joins plain class names', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('ignores falsy values', () => {
    expect(cn('base', false && 'nope', undefined, null, 'end')).toBe('base end');
  });

  it('deduplicates conflicting tailwind utilities — last wins', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('handles object syntax', () => {
    expect(cn({ foo: true, bar: false })).toBe('foo');
  });
});

describe('formatINR', () => {
  it('formats a number in Indian rupee format', () => {
    expect(formatINR(50000)).toContain('50,000');
    expect(formatINR(100000)).toContain('1,00,000');
  });

  it('does not include decimal places', () => {
    expect(formatINR(1234.99)).not.toContain('.');
  });

  it('formats zero', () => {
    expect(formatINR(0)).toContain('0');
  });
});

describe('formatSalaryRange', () => {
  it('returns "Salary not disclosed" when hide is true', () => {
    expect(formatSalaryRange(30000, 50000, true)).toBe('Salary not disclosed');
  });

  it('returns "Salary not disclosed" when both min and max are absent', () => {
    expect(formatSalaryRange()).toBe('Salary not disclosed');
    expect(formatSalaryRange(0, 0)).toBe('Salary not disclosed');
  });

  it('formats a full min–max range', () => {
    const result = formatSalaryRange(20000, 40000);
    expect(result).toContain('20,000');
    expect(result).toContain('40,000');
    expect(result).toContain('/ month');
  });

  it('formats min-only with "From" prefix', () => {
    const result = formatSalaryRange(25000);
    expect(result).toContain('From');
    expect(result).toContain('25,000');
  });

  it('formats max-only with "Up to" prefix', () => {
    const result = formatSalaryRange(undefined, 60000);
    expect(result).toContain('Up to');
    expect(result).toContain('60,000');
  });
});

describe('timeAgo', () => {
  const FIXED_NOW = new Date('2024-06-01T12:00:00Z').getTime();

  beforeAll(() => vi.setSystemTime(FIXED_NOW));
  afterAll(() => vi.useRealTimers());

  it('shows minutes for timestamps under an hour', () => {
    const date = new Date(FIXED_NOW - 30 * 60_000).toISOString();
    expect(timeAgo(date)).toBe('30m ago');
  });

  it('shows hours for timestamps a few hours ago', () => {
    const date = new Date(FIXED_NOW - 3 * 3_600_000).toISOString();
    expect(timeAgo(date)).toBe('3h ago');
  });

  it('shows days for timestamps within 30 days', () => {
    const date = new Date(FIXED_NOW - 5 * 86_400_000).toISOString();
    expect(timeAgo(date)).toBe('5d ago');
  });

  it('shows months for timestamps older than 30 days', () => {
    const date = new Date(FIXED_NOW - 90 * 86_400_000).toISOString();
    expect(timeAgo(date)).toBe('3mo ago');
  });
});

describe('formatDate', () => {
  it('formats a date string in en-IN locale', () => {
    // Use midday UTC to avoid date shifting due to local timezone offsets
    const result = formatDate('2024-06-15T12:00:00Z');
    expect(result).toContain('2024');
    expect(result).toContain('Jun');
  });
});

describe('truncate', () => {
  it('leaves strings within the limit unchanged', () => {
    expect(truncate('hello', 100)).toBe('hello');
  });

  it('uses a default limit of 100 characters', () => {
    const long = 'a'.repeat(101);
    expect(truncate(long)).toHaveLength(103);
    expect(truncate(long).endsWith('...')).toBe(true);
  });

  it('truncates at the specified length and appends ellipsis', () => {
    const result = truncate('a'.repeat(110), 50);
    expect(result).toHaveLength(53);
    expect(result.endsWith('...')).toBe(true);
  });

  it('does not truncate at exactly the limit', () => {
    expect(truncate('a'.repeat(100), 100)).toBe('a'.repeat(100));
  });

  it('truncates when length is one over the limit', () => {
    expect(truncate('a'.repeat(101), 100).endsWith('...')).toBe(true);
  });
});

describe('getInitials', () => {
  it('extracts two initials from a full name', () => {
    expect(getInitials('John Doe')).toBe('JD');
  });

  it('returns one initial for a single name', () => {
    expect(getInitials('Alice')).toBe('A');
  });

  it('uppercases initials', () => {
    expect(getInitials('john doe')).toBe('JD');
  });

  it('caps at two initials regardless of word count', () => {
    expect(getInitials('John Michael Andrew Doe')).toBe('JM');
  });
});

describe('employmentTypeLabel', () => {
  const cases: [string, string][] = [
    ['FULL_TIME', 'Full Time'],
    ['PART_TIME', 'Part Time'],
    ['INTERNSHIP', 'Internship'],
    ['FREELANCE', 'Freelance'],
    ['CONTRACT', 'Contract'],
  ];

  it.each(cases)('%s maps to "%s"', (key, label) => {
    expect(employmentTypeLabel[key]).toBe(label);
  });
});
