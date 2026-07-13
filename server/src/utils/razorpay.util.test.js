import crypto from 'crypto';
import { beforeAll, describe, expect, it } from 'vitest';
import { verifyRazorpaySignature, verifyWebhookSignature } from './razorpay.util.js';

const KEY_SECRET = 'test-razorpay-key-secret';
const WEBHOOK_SECRET = 'test-razorpay-webhook-secret';

beforeAll(() => {
  process.env.RAZORPAY_KEY_SECRET = KEY_SECRET;
  process.env.RAZORPAY_WEBHOOK_SECRET = WEBHOOK_SECRET;
});

function hmacHex(secret, data) {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

describe('verifyRazorpaySignature', () => {
  it('returns true for a valid order-payment signature', () => {
    const orderId = 'order_abc123';
    const paymentId = 'pay_xyz789';
    const signature = hmacHex(KEY_SECRET, `${orderId}|${paymentId}`);
    expect(verifyRazorpaySignature(orderId, paymentId, signature)).toBe(true);
  });

  it('returns false when the signature is tampered', () => {
    const orderId = 'order_abc123';
    const paymentId = 'pay_xyz789';
    const signature = hmacHex(KEY_SECRET, `${orderId}|${paymentId}`);
    expect(verifyRazorpaySignature(orderId, paymentId, signature + '0')).toBe(false);
  });

  it('returns false when order and payment IDs are swapped', () => {
    const orderId = 'order_abc123';
    const paymentId = 'pay_xyz789';
    const validSig = hmacHex(KEY_SECRET, `${orderId}|${paymentId}`);
    expect(verifyRazorpaySignature(paymentId, orderId, validSig)).toBe(false);
  });

  it('returns false for an empty signature', () => {
    expect(verifyRazorpaySignature('order_abc', 'pay_xyz', '')).toBe(false);
  });
});

describe('verifyWebhookSignature', () => {
  it('returns true for a valid webhook body + signature', () => {
    const rawBody = JSON.stringify({ event: 'payment.captured', payload: { id: '123' } });
    const signature = hmacHex(WEBHOOK_SECRET, rawBody);
    expect(verifyWebhookSignature(rawBody, signature)).toBe(true);
  });

  it('returns false when the body is tampered', () => {
    const rawBody = JSON.stringify({ event: 'payment.captured' });
    const signature = hmacHex(WEBHOOK_SECRET, rawBody);
    const tamperedBody = JSON.stringify({ event: 'payment.failed' });
    expect(verifyWebhookSignature(tamperedBody, signature)).toBe(false);
  });

  it('returns false for an empty signature', () => {
    const rawBody = '{"event":"payment.captured"}';
    expect(verifyWebhookSignature(rawBody, '')).toBe(false);
  });
});
