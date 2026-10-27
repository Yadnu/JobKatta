import { beforeEach, describe, expect, it, vi } from 'vitest';

// ─── mock database ────────────────────────────────────────────────────────────
const candidateFindUniqueMock = vi.fn();
const employerFindUniqueMock = vi.fn();
const subscriptionCreateMock = vi.fn();
const subscriptionFindUniqueMock = vi.fn();
const subscriptionFindFirstMock = vi.fn();
const subscriptionUpdateMock = vi.fn();
const subscriptionFindManyMock = vi.fn();
const subscriptionCountMock = vi.fn();
const userFindUniqueMock = vi.fn();

vi.mock('../config/database.js', () => ({
  default: {
    candidate: { findUnique: candidateFindUniqueMock },
    employer: { findUnique: employerFindUniqueMock },
    subscription: {
      create: subscriptionCreateMock,
      findUnique: subscriptionFindUniqueMock,
      findFirst: subscriptionFindFirstMock,
      update: subscriptionUpdateMock,
      findMany: subscriptionFindManyMock,
      count: subscriptionCountMock,
    },
    user: { findUnique: userFindUniqueMock },
  },
}));

// ─── mock razorpay ────────────────────────────────────────────────────────────
const razorpayOrdersCreateMock = vi.fn();
vi.mock('../config/razorpay.js', () => ({
  default: { orders: { create: razorpayOrdersCreateMock } },
}));

// ─── mock razorpay utils ──────────────────────────────────────────────────────
const verifyRazorpaySignatureMock = vi.fn();
const verifyWebhookSignatureMock = vi.fn();
vi.mock('../utils/razorpay.util.js', () => ({
  verifyRazorpaySignature: verifyRazorpaySignatureMock,
  verifyWebhookSignature: verifyWebhookSignatureMock,
}));

// ─── mock subscription service ────────────────────────────────────────────────
const activateCandidatePlanMock = vi.fn();
const activateEmployerPlanMock = vi.fn();
vi.mock('../services/subscription.service.js', () => ({
  activateCandidatePlan: activateCandidatePlanMock,
  activateEmployerPlan: activateEmployerPlanMock,
}));

// ─── mock email service ───────────────────────────────────────────────────────
vi.mock('../services/email.service.js', () => ({
  sendPaymentReceiptEmail: vi.fn().mockResolvedValue({ ok: true }),
}));

const { createOrder, verifyPayment, webhook, getHistory } = await import('./payment.controller.js');

const makeRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => vi.clearAllMocks());

// ─── createOrder ──────────────────────────────────────────────────────────────

describe('createOrder', () => {
  it('returns 400 when planKey is missing', async () => {
    const req = { user: { id: 'u1' }, body: { forRole: 'CANDIDATE' } };
    const next = vi.fn();
    await createOrder(req, makeRes(), next);
    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('returns 400 for an invalid plan combination', async () => {
    const req = { user: { id: 'u1' }, body: { planKey: 'GOLD', forRole: 'CANDIDATE' } };
    const next = vi.fn();
    await createOrder(req, makeRes(), next);
    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('creates a Razorpay order and subscription for a CANDIDATE plan', async () => {
    razorpayOrdersCreateMock.mockResolvedValue({ id: 'order_123' });
    candidateFindUniqueMock.mockResolvedValue({ id: 'cand-1' });
    subscriptionCreateMock.mockResolvedValue({ id: 'sub-1' });

    const req = { user: { id: 'u1' }, body: { planKey: 'PREMIUM_MONTHLY', forRole: 'CANDIDATE' } };
    const res = makeRes();
    await createOrder(req, res, vi.fn());

    expect(razorpayOrdersCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 9900, currency: 'INR' }),
    );
    expect(subscriptionCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: 'u1', amount: 99 }) }),
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ orderId: 'order_123' }) }),
    );
  });

  it('creates an order for an EMPLOYER plan', async () => {
    razorpayOrdersCreateMock.mockResolvedValue({ id: 'order_emp' });
    employerFindUniqueMock.mockResolvedValue({ id: 'emp-1' });
    subscriptionCreateMock.mockResolvedValue({ id: 'sub-2' });

    const req = { user: { id: 'u2' }, body: { planKey: 'ANNUAL', forRole: 'EMPLOYER' } };
    const res = makeRes();
    await createOrder(req, res, vi.fn());

    expect(razorpayOrdersCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 499900 }),
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ planKey: 'ANNUAL' }) }),
    );
  });
});

// ─── verifyPayment ────────────────────────────────────────────────────────────

describe('verifyPayment', () => {
  const baseBody = {
    razorpay_order_id: 'ord-1',
    razorpay_payment_id: 'pay-1',
    razorpay_signature: 'sig-1',
    subscriptionId: 'sub-1',
    planKey: 'PREMIUM_MONTHLY',
    forRole: 'CANDIDATE',
  };

  it('returns 400 when payment details are incomplete', async () => {
    const req = { user: { id: 'u1' }, body: { razorpay_order_id: 'ord-1' } };
    const next = vi.fn();
    await verifyPayment(req, makeRes(), next);
    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('returns 400 when signature verification fails', async () => {
    verifyRazorpaySignatureMock.mockReturnValue(false);
    const req = { user: { id: 'u1' }, body: baseBody };
    const next = vi.fn();
    await verifyPayment(req, makeRes(), next);
    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('returns 404 when subscription record is not found', async () => {
    verifyRazorpaySignatureMock.mockReturnValue(true);
    subscriptionFindUniqueMock.mockResolvedValue(null);
    const req = { user: { id: 'u1' }, body: baseBody };
    const next = vi.fn();
    await verifyPayment(req, makeRes(), next);
    expect(next.mock.calls[0][0].statusCode).toBe(404);
  });

  it('short-circuits when subscription is already paid', async () => {
    verifyRazorpaySignatureMock.mockReturnValue(true);
    subscriptionFindUniqueMock.mockResolvedValue({ id: 'sub-1', status: 'paid' });
    const req = { user: { id: 'u1' }, body: baseBody };
    const res = makeRes();
    await verifyPayment(req, res, vi.fn());
    expect(activateCandidatePlanMock).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Payment already processed' }));
  });

  it('activates a CANDIDATE plan on successful verification', async () => {
    verifyRazorpaySignatureMock.mockReturnValue(true);
    subscriptionFindUniqueMock.mockResolvedValue({ id: 'sub-1', status: 'pending', candidateId: 'cand-1', amount: 99 });
    subscriptionUpdateMock.mockResolvedValue({});
    activateCandidatePlanMock.mockResolvedValue(undefined);
    userFindUniqueMock.mockResolvedValue({ email: 'user@test.com' });

    const req = { user: { id: 'u1' }, body: baseBody };
    const res = makeRes();
    await verifyPayment(req, res, vi.fn());

    expect(activateCandidatePlanMock).toHaveBeenCalledWith('cand-1', 'PREMIUM_MONTHLY', 'sub-1');
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('activates an EMPLOYER plan on successful verification', async () => {
    verifyRazorpaySignatureMock.mockReturnValue(true);
    subscriptionFindUniqueMock.mockResolvedValue({ id: 'sub-2', status: 'pending', employerId: 'emp-1', amount: 4999 });
    subscriptionUpdateMock.mockResolvedValue({});
    activateEmployerPlanMock.mockResolvedValue(undefined);
    userFindUniqueMock.mockResolvedValue(null);

    const req = { user: { id: 'u2' }, body: { ...baseBody, forRole: 'EMPLOYER', planKey: 'ANNUAL', subscriptionId: 'sub-2' } };
    const res = makeRes();
    await verifyPayment(req, res, vi.fn());

    expect(activateEmployerPlanMock).toHaveBeenCalledWith('emp-1', 'ANNUAL', 'sub-2');
  });
});

// ─── webhook ──────────────────────────────────────────────────────────────────

describe('webhook', () => {
  it('returns 400 when webhook signature is invalid', async () => {
    verifyWebhookSignatureMock.mockReturnValue(false);
    const req = { headers: { 'x-razorpay-signature': 'bad' }, body: {} };
    const res = makeRes();
    await webhook(req, res, vi.fn());
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('processes a payment.captured event and activates the plan', async () => {
    verifyWebhookSignatureMock.mockReturnValue(true);
    const sub = { id: 'sub-1', status: 'pending', candidateId: 'cand-1' };
    subscriptionFindFirstMock.mockResolvedValue(sub);
    subscriptionUpdateMock.mockResolvedValue({});
    activateCandidatePlanMock.mockResolvedValue(undefined);

    const body = {
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay-1',
            order_id: 'ord-1',
            notes: { planKey: 'PREMIUM_MONTHLY', forRole: 'CANDIDATE' },
          },
        },
      },
    };
    const req = { headers: { 'x-razorpay-signature': 'sig' }, body };
    const res = makeRes();
    await webhook(req, res, vi.fn());

    expect(activateCandidatePlanMock).toHaveBeenCalledWith('cand-1', 'PREMIUM_MONTHLY', 'sub-1');
    expect(res.json).toHaveBeenCalledWith({ received: true });
  });

  it('acknowledges unknown events without side effects', async () => {
    verifyWebhookSignatureMock.mockReturnValue(true);
    const req = { headers: {}, body: { event: 'order.paid', payload: {} } };
    const res = makeRes();
    await webhook(req, res, vi.fn());
    expect(activateCandidatePlanMock).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ received: true });
  });
});

// ─── getHistory ───────────────────────────────────────────────────────────────

describe('getHistory', () => {
  it('returns paginated payment history for the authenticated user', async () => {
    const subs = [{ id: 'sub-1' }, { id: 'sub-2' }];
    subscriptionFindManyMock.mockResolvedValue(subs);
    subscriptionCountMock.mockResolvedValue(2);

    const req = { user: { id: 'u1' }, query: {} };
    const res = makeRes();
    await getHistory(req, res, vi.fn());

    expect(subscriptionFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'u1' } }),
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: subs, pagination: expect.any(Object) }),
    );
  });
});
