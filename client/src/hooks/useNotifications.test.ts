import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiMock, invalidateQueriesMock } = vi.hoisted(() => ({
  apiMock: { get: vi.fn(), put: vi.fn() },
  invalidateQueriesMock: vi.fn(),
}));

vi.mock('@/lib/api', () => ({ default: apiMock }));
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn((cfg) => cfg),
  useMutation: vi.fn((cfg) => cfg),
  useQueryClient: vi.fn(() => ({ invalidateQueries: invalidateQueriesMock })),
}));

import { useMarkAllRead, useMarkRead, useNotifications } from './useNotifications';

beforeEach(() => {
  vi.clearAllMocks();
  apiMock.get.mockResolvedValue({ data: { data: { notifications: [], unreadCount: 0 } } });
  apiMock.put.mockResolvedValue({ data: {} });
});

describe('useNotifications', () => {
  it('loads notifications on a 30 second stale time and a 60 second refresh', () => {
    const cfg = useNotifications() as any;
    expect(cfg.queryKey).toEqual(['notifications']);
    expect(cfg.staleTime).toBe(30 * 1000);
    expect(cfg.refetchInterval).toBe(60 * 1000);
  });

  it('queryFn returns the notifications payload from GET /notifications', async () => {
    const payload = { notifications: [{ id: 'n1' }], unreadCount: 1 };
    apiMock.get.mockResolvedValue({ data: { data: payload } });
    const cfg = useNotifications() as any;
    await expect(cfg.queryFn()).resolves.toEqual(payload);
    expect(apiMock.get).toHaveBeenCalledWith('/notifications');
  });
});

describe('useMarkAllRead', () => {
  it('calls PUT /notifications/read-all', async () => {
    const cfg = useMarkAllRead() as any;
    await cfg.mutationFn();
    expect(apiMock.put).toHaveBeenCalledWith('/notifications/read-all');
  });

  it('invalidates the notifications query after success', () => {
    const cfg = useMarkAllRead() as any;
    cfg.onSuccess();
    expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: ['notifications'] });
  });
});

describe('useMarkRead', () => {
  it('calls PUT /notifications/:id/read', async () => {
    const cfg = useMarkRead() as any;
    await cfg.mutationFn('n1');
    expect(apiMock.put).toHaveBeenCalledWith('/notifications/n1/read');
  });

  it('invalidates the notifications query after success', () => {
    const cfg = useMarkRead() as any;
    cfg.onSuccess();
    expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: ['notifications'] });
  });
});
