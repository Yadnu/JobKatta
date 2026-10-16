import { beforeEach, describe, expect, it, vi } from 'vitest';

// ─── mock cache.util and axios ────────────────────────────────────────────────
const setCacheMock = vi.fn();
const getCacheMock = vi.fn();
const deleteCacheMock = vi.fn();

vi.mock('../utils/cache.util.js', () => ({
  setCache: setCacheMock,
  getCache: getCacheMock,
  deleteCache: deleteCacheMock,
}));

const axiosGetMock = vi.fn();
vi.mock('axios', () => ({ default: { get: axiosGetMock } }));

const { sendOtp, verifyOtp } = await import('./otp.service.js');

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env.NODE_ENV;
});

// ─── sendOtp ──────────────────────────────────────────────────────────────────

describe('sendOtp', () => {
  it('stores the OTP in cache under the correct key with 600s TTL', async () => {
    setCacheMock.mockResolvedValue(undefined);
    const otp = await sendOtp('9876543210', 'LOGIN');

    expect(setCacheMock).toHaveBeenCalledWith(
      'otp:9876543210:LOGIN',
      otp,
      600,
    );
    expect(otp).toMatch(/^\d{6}$/);
  });

  it('generates a 6-digit numeric OTP', async () => {
    setCacheMock.mockResolvedValue(undefined);
    const otp = await sendOtp('9123456789', 'REGISTER');
    expect(Number(otp)).toBeGreaterThanOrEqual(100000);
    expect(Number(otp)).toBeLessThanOrEqual(999999);
  });

  it('does NOT call MSG91 in non-production environment', async () => {
    process.env.NODE_ENV = 'development';
    setCacheMock.mockResolvedValue(undefined);
    await sendOtp('9000000000', 'LOGIN');
    expect(axiosGetMock).not.toHaveBeenCalled();
  });

  it('calls MSG91 API in production environment', async () => {
    process.env.NODE_ENV = 'production';
    process.env.MSG91_AUTH_KEY = 'test-key';
    process.env.MSG91_TEMPLATE_ID = 'tmpl-1';
    setCacheMock.mockResolvedValue(undefined);
    axiosGetMock.mockResolvedValue({ data: {} });

    await sendOtp('9000000001', 'LOGIN');

    expect(axiosGetMock).toHaveBeenCalledWith(
      'https://api.msg91.com/api/v5/otp',
      expect.objectContaining({
        params: expect.objectContaining({ mobile: '919000000001' }),
      }),
    );
  });
});

// ─── verifyOtp ────────────────────────────────────────────────────────────────

describe('verifyOtp', () => {
  it('returns true and deletes the cache entry when OTP matches', async () => {
    getCacheMock.mockResolvedValue('123456');
    deleteCacheMock.mockResolvedValue(undefined);

    const result = await verifyOtp('9876543210', '123456', 'LOGIN');

    expect(result).toBe(true);
    expect(deleteCacheMock).toHaveBeenCalledWith('otp:9876543210:LOGIN');
  });

  it('returns false when the OTP does not match', async () => {
    getCacheMock.mockResolvedValue('111111');

    const result = await verifyOtp('9876543210', '999999', 'LOGIN');

    expect(result).toBe(false);
    expect(deleteCacheMock).not.toHaveBeenCalled();
  });

  it('returns false when there is no cached OTP (expired or not sent)', async () => {
    getCacheMock.mockResolvedValue(null);

    const result = await verifyOtp('9876543210', '123456', 'LOGIN');

    expect(result).toBe(false);
  });
});
