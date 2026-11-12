import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mutateAsyncMock, verifyMutateMock, pending, toastMock } = vi.hoisted(() => {
  const toastMock = Object.assign(vi.fn(), { error: vi.fn() });
  return {
    mutateAsyncMock: vi.fn(),
    verifyMutateMock: vi.fn(),
    pending: { creating: false, verifying: false },
    toastMock,
  };
});

vi.mock('@/hooks/useSubscription', () => ({
  useCreateOrder: () => ({ mutateAsync: mutateAsyncMock, isPending: pending.creating }),
  useVerifyPayment: () => ({ mutate: verifyMutateMock, isPending: pending.verifying }),
}));

vi.mock('react-hot-toast', () => ({ default: toastMock }));

import { useRazorpay } from './useRazorpay';

const SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

beforeEach(() => {
  vi.clearAllMocks();
  pending.creating = false;
  pending.verifying = false;
  document.body.innerHTML = '';
  delete (window as any).Razorpay;
});

describe('useRazorpay script', () => {
  it('injects the checkout script once', () => {
    const { unmount } = renderHook(() => useRazorpay());
    const script = document.querySelector(`script[src="${SCRIPT}"]`) as HTMLScriptElement;
    expect(script).not.toBeNull();
    expect(script.async).toBe(true);
    unmount();

    document.body.appendChild(script);
    renderHook(() => useRazorpay());
    expect(document.querySelectorAll(`script[src="${SCRIPT}"]`)).toHaveLength(1);
  });
});

describe('openCheckout', () => {
  const order = {
    orderId: 'order_1',
    amount: 9900,
    currency: 'INR',
    key: 'rzp_test',
    subscriptionId: 'sub_1',
  };

  it('reports the pending flags from the order and verify mutations', () => {
    pending.creating = true;
    pending.verifying = true;
    const { result } = renderHook(() => useRazorpay());
    expect(result.current.isCreatingOrder).toBe(true);
    expect(result.current.isVerifying).toBe(true);
  });

  it('toasts and returns when the Razorpay script has not loaded', async () => {
    const { result } = renderHook(() => useRazorpay());
    await result.current.openCheckout({ planKey: 'PREMIUM_MONTHLY', forRole: 'CANDIDATE' });
    expect(toastMock.error).toHaveBeenCalledWith('Payment gateway not loaded. Please refresh and try again.');
    expect(mutateAsyncMock).not.toHaveBeenCalled();
  });

  it('returns without opening checkout when creating the order fails', async () => {
    const open = vi.fn();
    (window as any).Razorpay = vi.fn(() => ({ open }));
    mutateAsyncMock.mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => useRazorpay());
    await result.current.openCheckout({ planKey: 'PREMIUM_MONTHLY', forRole: 'CANDIDATE' });
    expect(window.Razorpay).not.toHaveBeenCalled();
  });

  it('returns without opening checkout when the order payload is empty', async () => {
    const open = vi.fn();
    (window as any).Razorpay = vi.fn(() => ({ open }));
    mutateAsyncMock.mockResolvedValue(undefined);
    const { result } = renderHook(() => useRazorpay());
    await result.current.openCheckout({ planKey: 'PREMIUM_MONTHLY', forRole: 'CANDIDATE' });
    expect(window.Razorpay).not.toHaveBeenCalled();
  });

  it('opens checkout and verifies the payment from the success handler', async () => {
    const open = vi.fn();
    (window as any).Razorpay = vi.fn(() => ({ open }));
    mutateAsyncMock.mockResolvedValue(order);

    const { result } = renderHook(() => useRazorpay());
    await result.current.openCheckout({
      planKey: 'PREMIUM_MONTHLY',
      forRole: 'CANDIDATE',
      userName: 'Ada',
      userEmail: 'ada@mail.com',
    });

    expect(mutateAsyncMock).toHaveBeenCalledWith({ planKey: 'PREMIUM_MONTHLY', forRole: 'CANDIDATE' });
    const options = (window.Razorpay as any).mock.calls[0][0];
    expect(options).toMatchObject({
      key: 'rzp_test',
      amount: 9900,
      currency: 'INR',
      order_id: 'order_1',
      name: 'JobKatta',
      description: 'PREMIUM_MONTHLY Plan',
      prefill: { name: 'Ada', email: 'ada@mail.com' },
      theme: { color: '#6d28d9' },
    });
    expect(open).toHaveBeenCalledOnce();

    options.handler({
      razorpay_order_id: 'order_1',
      razorpay_payment_id: 'pay_1',
      razorpay_signature: 'sig',
    });
    expect(verifyMutateMock).toHaveBeenCalledWith({
      razorpay_order_id: 'order_1',
      razorpay_payment_id: 'pay_1',
      razorpay_signature: 'sig',
      subscriptionId: 'sub_1',
      planKey: 'PREMIUM_MONTHLY',
      forRole: 'CANDIDATE',
    });
  });

  it('toasts when the checkout modal is dismissed', async () => {
    (window as any).Razorpay = vi.fn(() => ({ open: vi.fn() }));
    mutateAsyncMock.mockResolvedValue(order);
    const { result } = renderHook(() => useRazorpay());
    await result.current.openCheckout({ planKey: 'ANNUAL', forRole: 'EMPLOYER' });
    const options = (window.Razorpay as any).mock.calls[0][0];
    options.modal.ondismiss();
    expect(toastMock).toHaveBeenCalledWith('Payment cancelled.', { icon: '⚠️' });
  });
});
