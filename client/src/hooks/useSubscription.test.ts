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

import { usePaymentHistory, useCreateOrder, useVerifyPayment, usePlanInfo } from './useSubscription';

beforeEach(() => {
  vi.clearAllMocks();
  apiMock.get.mockResolvedValue({ data: { data: [] } });
  apiMock.post.mockResolvedValue({ data: { data: { orderId: 'ord-1' } } });
});

describe('usePaymentHistory', () => {
  it('uses query key ["payments", "history"]', () => {
    expect((usePaymentHistory() as any).queryKey).toEqual(['payments', 'history']);
  });
  it('queryFn calls GET /payments/history', async () => {
    await (usePaymentHistory() as any).queryFn();
    expect(apiMock.get).toHaveBeenCalledWith('/payments/history');
  });
});

describe('useCreateOrder', () => {
  it('mutationFn calls POST /payments/create-order with planKey and forRole', async () => {
    apiMock.post.mockResolvedValue({ data: { data: { orderId: 'ord-1', key: 'rzp_key' } } });
    await (useCreateOrder() as any).mutationFn({ planKey: 'ANNUAL', forRole: 'EMPLOYER' });
    expect(apiMock.post).toHaveBeenCalledWith(
      '/payments/create-order',
      { planKey: 'ANNUAL', forRole: 'EMPLOYER' },
    );
  });
});

describe('useVerifyPayment', () => {
  const payload = {
    razorpay_order_id: 'ord-1',
    razorpay_payment_id: 'pay-1',
    razorpay_signature: 'sig-1',
    subscriptionId: 'sub-1',
    planKey: 'ANNUAL',
    forRole: 'EMPLOYER',
  };

  it('mutationFn calls POST /payments/verify with all fields', async () => {
    await (useVerifyPayment() as any).mutationFn(payload);
    expect(apiMock.post).toHaveBeenCalledWith('/payments/verify', payload);
  });

  it('onSuccess invalidates me, candidate profile, employer profile, and payment history', async () => {
    await (useVerifyPayment() as any).onSuccess();
    expect(invalidateQueriesMock).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['me'] }));
    expect(invalidateQueriesMock).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['candidate', 'profile'] }));
    expect(invalidateQueriesMock).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['employer', 'profile'] }));
    expect(invalidateQueriesMock).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['payments', 'history'] }));
  });
});

describe('usePlanInfo', () => {
  it('returns CANDIDATE plans for role CANDIDATE', () => {
    const plans = usePlanInfo('CANDIDATE');
    expect(plans.length).toBeGreaterThan(0);
    expect(plans.some((p) => p.key === 'PREMIUM_MONTHLY')).toBe(true);
  });
  it('returns EMPLOYER plans for role EMPLOYER', () => {
    const plans = usePlanInfo('EMPLOYER');
    expect(plans.some((p) => p.key === 'ANNUAL')).toBe(true);
  });
  it('returns an empty array for null role', () => {
    expect(usePlanInfo(null)).toEqual([]);
  });
  it('all plans have key, label, price, and features', () => {
    [...usePlanInfo('CANDIDATE'), ...usePlanInfo('EMPLOYER')].forEach((p) => {
      expect(p).toHaveProperty('key');
      expect(p).toHaveProperty('label');
      expect(p).toHaveProperty('price');
      expect(p).toHaveProperty('features');
    });
  });
});
