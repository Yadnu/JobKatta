import { beforeEach, describe, expect, it, vi } from 'vitest';

// ─── mock resend ──────────────────────────────────────────────────────────────
const sendMock = vi.fn();
vi.mock('resend', () => ({
  Resend: class {
    constructor() { this.emails = { send: sendMock }; }
  },
}));

// ─── mock fs (template loading) ───────────────────────────────────────────────
vi.mock('fs', () => ({
  default: { readFileSync: vi.fn().mockReturnValue('<p>Hello {{name}}</p>') },
  readFileSync: vi.fn().mockReturnValue('<p>Hello {{name}}</p>'),
}));

const {
  sendEmailReliable,
  getEmailMetrics,
  deliverVerifyEmail,
  deliverPasswordResetEmail,
} = await import('./email.service.js');

beforeEach(() => {
  vi.clearAllMocks();
  // Reset metrics between tests by re-importing would be complex;
  // instead we verify relative changes.
});

// ─── getEmailMetrics ──────────────────────────────────────────────────────────

describe('getEmailMetrics', () => {
  it('returns a metrics snapshot object with expected keys', () => {
    const m = getEmailMetrics();
    expect(m).toMatchObject({
      sent: expect.any(Number),
      failed: expect.any(Number),
      retried: expect.any(Number),
    });
    expect('lastFailure' in m).toBe(true);
  });

  it('returns a copy — mutations to the returned object do not affect internal state', () => {
    const m = getEmailMetrics();
    const before = m.sent;
    m.sent = 99999;
    expect(getEmailMetrics().sent).toBe(before);
  });
});

// ─── sendEmailReliable ────────────────────────────────────────────────────────

describe('sendEmailReliable', () => {
  it('returns { ok: true } on first-attempt success', async () => {
    sendMock.mockResolvedValue({ error: null });

    const result = await sendEmailReliable({
      to: 'test@example.com',
      subject: 'Test',
      templateName: 'verify-email',
      data: { name: 'Alice' },
    });

    expect(result.ok).toBe(true);
    expect(sendMock).toHaveBeenCalledTimes(1);
  });

  it('retries on failure and returns { ok: true } when a later attempt succeeds', async () => {
    sendMock
      .mockResolvedValueOnce({ error: { message: 'Rate limited' } })
      .mockResolvedValueOnce({ error: null });

    const result = await sendEmailReliable(
      { to: 'test@example.com', subject: 'Test', templateName: 'verify-email', data: {} },
      3,
    );

    expect(result.ok).toBe(true);
    expect(sendMock).toHaveBeenCalledTimes(2);
  }, 10000);

  it('returns { ok: false } after exhausting all retries', async () => {
    sendMock.mockResolvedValue({ error: { message: 'Provider down' } });

    const result = await sendEmailReliable(
      { to: 'fail@example.com', subject: 'Test', templateName: 'verify-email', data: {} },
      2,
    );

    expect(result.ok).toBe(false);
    expect(result.error).toBeInstanceOf(Error);
    expect(sendMock).toHaveBeenCalledTimes(2);
  }, 10000);

  it('returns { ok: false } when provider throws instead of returning error object', async () => {
    sendMock.mockRejectedValue(new Error('Network error'));

    const result = await sendEmailReliable(
      { to: 'fail@example.com', subject: 'Test', templateName: 'verify-email', data: {} },
      1,
    );

    expect(result.ok).toBe(false);
    expect(result.error?.message).toBe('Network error');
  });

  it('interpolates template variables via the template loader', async () => {
    sendMock.mockResolvedValue({ error: null });
    await sendEmailReliable({
      to: 'user@example.com',
      subject: 'Hi',
      templateName: 'welcome-candidate',
      data: { name: 'Bob' },
    });

    const callArg = sendMock.mock.calls[0][0];
    expect(callArg.html).toContain('Hello Bob');
  });
});

// ─── deliverVerifyEmail / deliverPasswordResetEmail ───────────────────────────

describe('deliverVerifyEmail', () => {
  it('calls sendEmailReliable with the correct subject', async () => {
    sendMock.mockResolvedValue({ error: null });
    const result = await deliverVerifyEmail('user@example.com', { name: 'Alice' });
    expect(result.ok).toBe(true);
    const args = sendMock.mock.calls[0][0];
    expect(args.subject).toMatch(/verify/i);
  });
});

describe('deliverPasswordResetEmail', () => {
  it('calls sendEmailReliable with the correct subject', async () => {
    sendMock.mockResolvedValue({ error: null });
    const result = await deliverPasswordResetEmail('user@example.com', { token: 'abc' });
    expect(result.ok).toBe(true);
    const args = sendMock.mock.calls[0][0];
    expect(args.subject).toMatch(/reset/i);
  });
});
