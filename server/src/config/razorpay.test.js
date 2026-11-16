import { beforeEach, describe, expect, it, vi } from 'vitest';

const { RazorpayMock } = vi.hoisted(() => {
  function Razorpay(options) {
    this.options = options;
  }
  return { RazorpayMock: vi.fn(Razorpay) };
});

vi.mock('razorpay', () => ({ default: RazorpayMock }));

const load = async ({ keyId, keySecret } = {}) => {
  vi.resetModules();
  if (keyId === undefined) delete process.env.RAZORPAY_KEY_ID;
  else process.env.RAZORPAY_KEY_ID = keyId;
  if (keySecret === undefined) delete process.env.RAZORPAY_KEY_SECRET;
  else process.env.RAZORPAY_KEY_SECRET = keySecret;
  return import('./razorpay.js');
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('razorpay client', () => {
  it('uses the key id and secret from the environment', async () => {
    const client = (await load({ keyId: 'rzp_live_1', keySecret: 'live-secret' })).default;
    expect(RazorpayMock).toHaveBeenCalledWith({
      key_id: 'rzp_live_1',
      key_secret: 'live-secret',
    });
    expect(client.options).toEqual({ key_id: 'rzp_live_1', key_secret: 'live-secret' });
  });

  it('falls back to placeholder credentials when the environment is empty', async () => {
    await load();
    expect(RazorpayMock).toHaveBeenCalledWith({
      key_id: 'rzp_test_placeholder',
      key_secret: 'placeholder_secret',
    });
  });
});
