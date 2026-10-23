import { describe, expect, it } from 'vitest';
import { createOrderSchema, verifyPaymentSchema } from './payment.validations.js';

const b = (body) => ({ body, query: {}, params: {} });

// ─── createOrderSchema ────────────────────────────────────────────────────────

describe('createOrderSchema', () => {
  it('accepts a valid CANDIDATE plan order', () => {
    expect(createOrderSchema.safeParse(b({ planKey: 'PREMIUM_MONTHLY', forRole: 'CANDIDATE' })).success).toBe(true);
  });

  it('accepts a valid EMPLOYER plan order', () => {
    expect(createOrderSchema.safeParse(b({ planKey: 'ANNUAL', forRole: 'EMPLOYER' })).success).toBe(true);
  });

  it('rejects an invalid forRole', () => {
    expect(createOrderSchema.safeParse(b({ planKey: 'BASIC', forRole: 'ADMIN' })).success).toBe(false);
  });

  it('rejects a missing planKey', () => {
    expect(createOrderSchema.safeParse(b({ forRole: 'CANDIDATE' })).success).toBe(false);
  });

  it('rejects a missing forRole', () => {
    expect(createOrderSchema.safeParse(b({ planKey: 'BASIC' })).success).toBe(false);
  });

  it('rejects an empty planKey', () => {
    expect(createOrderSchema.safeParse(b({ planKey: '', forRole: 'EMPLOYER' })).success).toBe(false);
  });
});

// ─── verifyPaymentSchema ──────────────────────────────────────────────────────

describe('verifyPaymentSchema', () => {
  const base = {
    razorpay_order_id: 'order_abc123',
    razorpay_payment_id: 'pay_xyz789',
    razorpay_signature: 'sig_abc',
    subscriptionId: 'sub-1',
    planKey: 'ANNUAL',
    forRole: 'EMPLOYER',
  };

  it('accepts all required payment verification fields', () => {
    expect(verifyPaymentSchema.safeParse(b(base)).success).toBe(true);
  });

  it('rejects missing razorpay_order_id', () => {
    const { razorpay_order_id: _, ...rest } = base;
    expect(verifyPaymentSchema.safeParse(b(rest)).success).toBe(false);
  });

  it('rejects missing razorpay_payment_id', () => {
    const { razorpay_payment_id: _, ...rest } = base;
    expect(verifyPaymentSchema.safeParse(b(rest)).success).toBe(false);
  });

  it('rejects missing razorpay_signature', () => {
    const { razorpay_signature: _, ...rest } = base;
    expect(verifyPaymentSchema.safeParse(b(rest)).success).toBe(false);
  });

  it('rejects missing subscriptionId', () => {
    const { subscriptionId: _, ...rest } = base;
    expect(verifyPaymentSchema.safeParse(b(rest)).success).toBe(false);
  });

  it('rejects an invalid forRole', () => {
    expect(verifyPaymentSchema.safeParse(b({ ...base, forRole: 'ADMIN' })).success).toBe(false);
  });

  it('rejects an empty planKey', () => {
    expect(verifyPaymentSchema.safeParse(b({ ...base, planKey: '' })).success).toBe(false);
  });
});
