import { beforeEach, describe, expect, it, vi } from 'vitest';

// ─── mock database ────────────────────────────────────────────────────────────
const dbMock = {
  candidate: { update: vi.fn(), findUnique: vi.fn() },
  employer: { update: vi.fn(), findUnique: vi.fn() },
  subscription: { update: vi.fn() },
  job: { count: vi.fn() },
};
vi.mock('../config/database.js', () => ({ default: dbMock }));

const {
  activateCandidatePlan,
  activateEmployerPlan,
  checkEmployerJobLimit,
  checkCandidateAppLimit,
} = await import('./subscription.service.js');

beforeEach(() => vi.clearAllMocks());

// ─── activateCandidatePlan ────────────────────────────────────────────────────

describe('activateCandidatePlan', () => {
  it('throws when planKey is invalid', async () => {
    await expect(activateCandidatePlan('cand-1', 'INVALID_PLAN', 'sub-1')).rejects.toThrow('Invalid plan');
  });

  it('updates the candidate and subscription on a valid plan', async () => {
    dbMock.candidate.update.mockResolvedValue({});
    dbMock.subscription.update.mockResolvedValue({});

    await activateCandidatePlan('cand-1', 'PREMIUM_MONTHLY', 'sub-1');

    expect(dbMock.candidate.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'cand-1' } }),
    );
    expect(dbMock.subscription.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'sub-1' }, data: expect.objectContaining({ status: 'paid' }) }),
    );
  });
});

// ─── activateEmployerPlan ─────────────────────────────────────────────────────

describe('activateEmployerPlan', () => {
  it('throws when planKey is invalid', async () => {
    await expect(activateEmployerPlan('emp-1', 'GOLD_PLAN', 'sub-2')).rejects.toThrow('Invalid plan');
  });

  it('updates the employer and subscription on a valid plan', async () => {
    dbMock.employer.update.mockResolvedValue({});
    dbMock.subscription.update.mockResolvedValue({});

    await activateEmployerPlan('emp-1', 'STANDARD', 'sub-2');

    expect(dbMock.employer.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'emp-1' } }),
    );
    expect(dbMock.subscription.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'sub-2' }, data: expect.objectContaining({ status: 'paid' }) }),
    );
  });
});

// ─── checkEmployerJobLimit ────────────────────────────────────────────────────

describe('checkEmployerJobLimit', () => {
  it('throws when the employer is not found', async () => {
    dbMock.employer.findUnique.mockResolvedValue(null);
    await expect(checkEmployerJobLimit('emp-99')).rejects.toThrow('Employer not found');
  });

  it('returns not-allowed when the employer is on the FREE plan', async () => {
    dbMock.employer.findUnique.mockResolvedValue({ planType: 'FREE', planExpiresAt: null, activeJobLimit: 1 });
    const result = await checkEmployerJobLimit('emp-1');
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/subscription required/i);
  });

  it('returns not-allowed when the employer plan has expired', async () => {
    dbMock.employer.findUnique.mockResolvedValue({
      planType: 'BASIC',
      planExpiresAt: new Date(Date.now() - 86400000), // yesterday
      activeJobLimit: 3,
    });
    const result = await checkEmployerJobLimit('emp-1');
    expect(result.allowed).toBe(false);
  });

  it('returns not-allowed when at the active job limit', async () => {
    dbMock.employer.findUnique.mockResolvedValue({
      planType: 'STANDARD',
      planExpiresAt: new Date(Date.now() + 86400000),
      activeJobLimit: 2,
    });
    dbMock.job.count.mockResolvedValue(2);
    const result = await checkEmployerJobLimit('emp-1');
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/maximum/i);
  });

  it('returns allowed when under the active job limit', async () => {
    dbMock.employer.findUnique.mockResolvedValue({
      planType: 'ANNUAL',
      planExpiresAt: new Date(Date.now() + 86400000),
      activeJobLimit: 10,
    });
    dbMock.job.count.mockResolvedValue(4);
    const result = await checkEmployerJobLimit('emp-1');
    expect(result.allowed).toBe(true);
  });
});

// ─── checkCandidateAppLimit ───────────────────────────────────────────────────

describe('checkCandidateAppLimit', () => {
  it('throws when the candidate is not found', async () => {
    dbMock.candidate.findUnique.mockResolvedValue(null);
    await expect(checkCandidateAppLimit('cand-99')).rejects.toThrow('Candidate not found');
  });

  it('always allows a PREMIUM candidate with a valid plan', async () => {
    dbMock.candidate.findUnique.mockResolvedValue({
      planType: 'PREMIUM',
      planExpiresAt: new Date(Date.now() + 86400000),
      appCountThisMonth: 100,
      appCountReset: new Date(),
    });
    const result = await checkCandidateAppLimit('cand-1');
    expect(result.allowed).toBe(true);
  });

  it('resets the monthly count and allows when the month has rolled over', async () => {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    dbMock.candidate.findUnique.mockResolvedValue({
      planType: 'FREE',
      planExpiresAt: null,
      appCountThisMonth: 5,
      appCountReset: lastMonth,
    });
    dbMock.candidate.update.mockResolvedValue({});

    const result = await checkCandidateAppLimit('cand-1');

    expect(dbMock.candidate.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ appCountThisMonth: 0 }) }),
    );
    expect(result.allowed).toBe(true);
  });

  it('returns not-allowed when a FREE candidate hits the 5 application limit', async () => {
    const now = new Date();
    dbMock.candidate.findUnique.mockResolvedValue({
      planType: 'FREE',
      planExpiresAt: null,
      appCountThisMonth: 5,
      appCountReset: now,
    });

    const result = await checkCandidateAppLimit('cand-1');

    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/5 applications/i);
  });

  it('returns allowed when a FREE candidate is under the 5 application limit', async () => {
    const now = new Date();
    dbMock.candidate.findUnique.mockResolvedValue({
      planType: 'FREE',
      planExpiresAt: null,
      appCountThisMonth: 3,
      appCountReset: now,
    });

    const result = await checkCandidateAppLimit('cand-1');

    expect(result.allowed).toBe(true);
  });
});
