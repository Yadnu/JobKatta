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

import { useMyTickets, useTicket, useCreateTicket } from './useSupport';

beforeEach(() => {
  vi.clearAllMocks();
  apiMock.get.mockResolvedValue({ data: { data: [] } });
  apiMock.post.mockResolvedValue({ data: {} });
});

describe('useMyTickets', () => {
  it('includes page in query key', () => {
    expect((useMyTickets(2) as any).queryKey).toEqual(['support', 'tickets', 2]);
  });
  it('queryFn calls GET /support/tickets with page param', async () => {
    await (useMyTickets(2) as any).queryFn();
    expect(apiMock.get).toHaveBeenCalledWith('/support/tickets', { params: { page: 2 } });
  });
  it('staleTime is 2 minutes', () => {
    expect((useMyTickets() as any).staleTime).toBe(2 * 60 * 1000);
  });
});

describe('useTicket', () => {
  it('is disabled when id is empty', () => {
    expect((useTicket('') as any).enabled).toBe(false);
  });
  it('uses query key ["support", "ticket", id]', () => {
    expect((useTicket('t-1') as any).queryKey).toEqual(['support', 'ticket', 't-1']);
  });
  it('queryFn calls GET /support/tickets/:id', async () => {
    apiMock.get.mockResolvedValue({ data: { data: {} } });
    await (useTicket('t-1') as any).queryFn();
    expect(apiMock.get).toHaveBeenCalledWith('/support/tickets/t-1');
  });
});

describe('useCreateTicket', () => {
  it('mutationFn calls POST /support/tickets with subject and message', async () => {
    await (useCreateTicket() as any).mutationFn({ subject: 'Bug report', message: 'Cannot login.' });
    expect(apiMock.post).toHaveBeenCalledWith('/support/tickets', { subject: 'Bug report', message: 'Cannot login.' });
  });
  it('onSuccess invalidates tickets query', async () => {
    await (useCreateTicket() as any).onSuccess();
    expect(invalidateQueriesMock).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['support', 'tickets'] }));
  });
});
