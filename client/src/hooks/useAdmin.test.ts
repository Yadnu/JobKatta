import { describe, expect, it, vi, beforeEach } from 'vitest';

const { apiMock, invalidateQueriesMock } = vi.hoisted(() => ({
  apiMock: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  invalidateQueriesMock: vi.fn(),
}));
vi.mock('@/lib/api', () => ({ default: apiMock }));
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn((cfg) => cfg),
  useMutation: vi.fn((cfg) => cfg),
  useQueryClient: vi.fn(() => ({ invalidateQueries: invalidateQueriesMock })),
}));
vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));

import {
  useAdminStats, useAdminRevenue,
  useAdminPendingJobs, useAdminJobs, useApproveJob, useRejectJob,
  useAdminCandidates, useAdminCandidate, useSuspendCandidate,
  useAdminEmployers, useAdminEmployer, useSuspendEmployer, useVerifyEmployer, useUpgradePlan,
  useAdminSubscriptions, useAdminFlags, useResolveFlag,
  useAdminTickets, useReplyTicket, useUpdateTicketStatus,
} from './useAdmin';

beforeEach(() => {
  vi.clearAllMocks();
  apiMock.get.mockResolvedValue({ data: { data: {} } });
  apiMock.put.mockResolvedValue({ data: {} });
});

// ─── Stats & Revenue ──────────────────────────────────────────────────────────

describe('useAdminStats', () => {
  it('uses query key ["admin", "stats"]', () => {
    expect((useAdminStats() as any).queryKey).toEqual(['admin', 'stats']);
  });
  it('queryFn calls GET /admin/stats', async () => {
    await (useAdminStats() as any).queryFn();
    expect(apiMock.get).toHaveBeenCalledWith('/admin/stats');
  });
});

describe('useAdminRevenue', () => {
  it('queryFn calls GET /admin/revenue', async () => {
    await (useAdminRevenue() as any).queryFn();
    expect(apiMock.get).toHaveBeenCalledWith('/admin/revenue');
  });
});

// ─── Jobs ─────────────────────────────────────────────────────────────────────

describe('useAdminPendingJobs', () => {
  it('queryFn calls GET /admin/jobs/pending with page', async () => {
    await (useAdminPendingJobs(2) as any).queryFn();
    expect(apiMock.get).toHaveBeenCalledWith('/admin/jobs/pending?page=2');
  });
});

describe('useAdminJobs', () => {
  it('includes page and filters in query key', () => {
    const filters = { status: 'ACTIVE' };
    expect((useAdminJobs(1, filters) as any).queryKey).toEqual(['admin', 'jobs', 1, filters]);
  });
  it('queryFn serialises filter params', async () => {
    await (useAdminJobs(1, { status: 'PENDING_APPROVAL', search: 'dev' }) as any).queryFn();
    const url: string = apiMock.get.mock.calls[0][0];
    expect(url).toContain('status=PENDING_APPROVAL');
    expect(url).toContain('search=dev');
  });
});

describe('useApproveJob', () => {
  it('mutationFn calls PUT /admin/jobs/:id/approve', async () => {
    await (useApproveJob() as any).mutationFn('job-1');
    expect(apiMock.put).toHaveBeenCalledWith('/admin/jobs/job-1/approve');
  });
  it('onSuccess invalidates admin jobs and stats', async () => {
    await (useApproveJob() as any).onSuccess();
    expect(invalidateQueriesMock).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['admin', 'jobs'] }));
    expect(invalidateQueriesMock).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['admin', 'stats'] }));
  });
});

describe('useRejectJob', () => {
  it('mutationFn calls PUT /admin/jobs/:id/reject with reason', async () => {
    await (useRejectJob() as any).mutationFn({ id: 'job-2', rejectionReason: 'Spam' });
    expect(apiMock.put).toHaveBeenCalledWith('/admin/jobs/job-2/reject', { rejectionReason: 'Spam' });
  });
});

// ─── Candidates ───────────────────────────────────────────────────────────────

describe('useAdminCandidates', () => {
  it('queryFn includes search param when provided', async () => {
    await (useAdminCandidates(1, 'Alice') as any).queryFn();
    const url: string = apiMock.get.mock.calls[0][0];
    expect(url).toContain('search=Alice');
  });
});

describe('useAdminCandidate', () => {
  it('is disabled when id is empty', () => {
    expect((useAdminCandidate('') as any).enabled).toBe(false);
  });
  it('queryFn calls GET /admin/candidates/:id', async () => {
    await (useAdminCandidate('cand-1') as any).queryFn();
    expect(apiMock.get).toHaveBeenCalledWith('/admin/candidates/cand-1');
  });
});

describe('useSuspendCandidate', () => {
  it('mutationFn calls PUT /admin/candidates/:id/suspend', async () => {
    await (useSuspendCandidate() as any).mutationFn('cand-1');
    expect(apiMock.put).toHaveBeenCalledWith('/admin/candidates/cand-1/suspend');
  });
});

// ─── Employers ────────────────────────────────────────────────────────────────

describe('useAdminEmployer', () => {
  it('is disabled when id is empty', () => {
    expect((useAdminEmployer('') as any).enabled).toBe(false);
  });
  it('queryFn calls GET /admin/employers/:id', async () => {
    await (useAdminEmployer('emp-1') as any).queryFn();
    expect(apiMock.get).toHaveBeenCalledWith('/admin/employers/emp-1');
  });
});

describe('useSuspendEmployer', () => {
  it('mutationFn calls PUT /admin/employers/:id/suspend', async () => {
    await (useSuspendEmployer() as any).mutationFn('emp-2');
    expect(apiMock.put).toHaveBeenCalledWith('/admin/employers/emp-2/suspend');
  });
});

describe('useVerifyEmployer', () => {
  it('mutationFn calls PUT /admin/employers/:id/verify', async () => {
    await (useVerifyEmployer() as any).mutationFn('emp-3');
    expect(apiMock.put).toHaveBeenCalledWith('/admin/employers/emp-3/verify');
  });
});

describe('useUpgradePlan', () => {
  it('mutationFn calls PUT /admin/employers/:id/upgrade-plan with planType', async () => {
    await (useUpgradePlan() as any).mutationFn({ id: 'emp-4', planType: 'ANNUAL', durationDays: 365 });
    expect(apiMock.put).toHaveBeenCalledWith('/admin/employers/emp-4/upgrade-plan', { planType: 'ANNUAL', durationDays: 365 });
  });
});

// ─── Subscriptions / Flags ────────────────────────────────────────────────────

describe('useAdminSubscriptions', () => {
  it('queryFn includes filters in URL', async () => {
    await (useAdminSubscriptions(1, { status: 'paid', planType: 'ANNUAL' }) as any).queryFn();
    const url: string = apiMock.get.mock.calls[0][0];
    expect(url).toContain('status=paid');
    expect(url).toContain('planType=ANNUAL');
  });
});

describe('useResolveFlag', () => {
  it('mutationFn calls PUT /admin/flags/:id/resolve', async () => {
    await (useResolveFlag() as any).mutationFn('flag-1');
    expect(apiMock.put).toHaveBeenCalledWith('/admin/flags/flag-1/resolve');
  });
});

// ─── Support Tickets ──────────────────────────────────────────────────────────

describe('useReplyTicket', () => {
  it('mutationFn calls PUT /admin/support/:id/reply with reply', async () => {
    await (useReplyTicket() as any).mutationFn({ id: 't-1', reply: 'Issue resolved.' });
    expect(apiMock.put).toHaveBeenCalledWith('/admin/support/t-1/reply', { reply: 'Issue resolved.' });
  });
});

describe('useUpdateTicketStatus', () => {
  it('mutationFn calls PUT /admin/support/:id/status', async () => {
    await (useUpdateTicketStatus() as any).mutationFn({ id: 't-2', status: 'RESOLVED' });
    expect(apiMock.put).toHaveBeenCalledWith('/admin/support/t-2/status', { status: 'RESOLVED' });
  });
  it('onSuccess invalidates admin tickets', async () => {
    await (useUpdateTicketStatus() as any).onSuccess();
    expect(invalidateQueriesMock).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['admin', 'tickets'] }));
  });
});
