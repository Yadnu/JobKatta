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
  useAlerts,
  useCreateAlert,
  useUpdateAlert,
  useDeleteAlert,
} from './useAlerts';

beforeEach(() => {
  vi.clearAllMocks();
  apiMock.get.mockResolvedValue({ data: { data: [] } });
  apiMock.post.mockResolvedValue({ data: {} });
  apiMock.put.mockResolvedValue({ data: {} });
  apiMock.delete.mockResolvedValue({ data: {} });
});

// ─── useAlerts ────────────────────────────────────────────────────────────────

describe('useAlerts', () => {
  it('uses query key ["candidate", "alerts"]', () => {
    const cfg = useAlerts() as any;
    expect(cfg.queryKey).toEqual(['candidate', 'alerts']);
  });

  it('queryFn calls GET /candidate/alerts', async () => {
    const cfg = useAlerts() as any;
    await cfg.queryFn();
    expect(apiMock.get).toHaveBeenCalledWith('/candidate/alerts');
  });

  it('has a staleTime of 2 minutes', () => {
    const cfg = useAlerts() as any;
    expect(cfg.staleTime).toBe(2 * 60 * 1000);
  });
});

// ─── useCreateAlert ───────────────────────────────────────────────────────────

describe('useCreateAlert', () => {
  it('mutationFn calls POST /candidate/alerts with data', async () => {
    const cfg = useCreateAlert() as any;
    await cfg.mutationFn({ keywords: 'react developer', city: 'Pune', jobType: 'FULL_TIME' });
    expect(apiMock.post).toHaveBeenCalledWith('/candidate/alerts', {
      keywords: 'react developer',
      city: 'Pune',
      jobType: 'FULL_TIME',
    });
  });

  it('onSuccess invalidates alerts query', async () => {
    const cfg = useCreateAlert() as any;
    await cfg.onSuccess();
    expect(invalidateQueriesMock).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['candidate', 'alerts'] }),
    );
  });
});

// ─── useUpdateAlert ───────────────────────────────────────────────────────────

describe('useUpdateAlert', () => {
  it('mutationFn calls PUT /candidate/alerts/:id with the partial data (excluding id)', async () => {
    const cfg = useUpdateAlert() as any;
    await cfg.mutationFn({ id: 'alert-1', city: 'Mumbai' });
    expect(apiMock.put).toHaveBeenCalledWith('/candidate/alerts/alert-1', { city: 'Mumbai' });
  });

  it('onSuccess invalidates alerts query', async () => {
    const cfg = useUpdateAlert() as any;
    await cfg.onSuccess();
    expect(invalidateQueriesMock).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['candidate', 'alerts'] }),
    );
  });
});

// ─── useDeleteAlert ───────────────────────────────────────────────────────────

describe('useDeleteAlert', () => {
  it('mutationFn calls DELETE /candidate/alerts/:id', async () => {
    const cfg = useDeleteAlert() as any;
    await cfg.mutationFn('alert-5');
    expect(apiMock.delete).toHaveBeenCalledWith('/candidate/alerts/alert-5');
  });

  it('onSuccess invalidates alerts query', async () => {
    const cfg = useDeleteAlert() as any;
    await cfg.onSuccess();
    expect(invalidateQueriesMock).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['candidate', 'alerts'] }),
    );
  });
});
