import { describe, expect, it } from 'vitest';
import {
  forgotPasswordSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  resetPasswordSchema,
  sendOtpSchema,
  verifyEmailSchema,
  verifyOtpSchema,
} from './auth.validations.js';

// Helper — wraps input as { body, query, params } to match what validate.middleware passes in
const b = (body) => ({ body, query: {}, params: {} });
const q = (query) => ({ body: {}, query, params: {} });

// ─── registerSchema ───────────────────────────────────────────────────────────

describe('registerSchema', () => {
  const base = {
    role: 'CANDIDATE',
    email: 'user@example.com',
    password: 'Secret123',
    city: 'Mumbai',
    state: 'Maharashtra',
  };

  it('accepts a valid candidate registration', () => {
    expect(registerSchema.safeParse(b(base)).success).toBe(true);
  });

  it('accepts EMPLOYER role', () => {
    expect(registerSchema.safeParse(b({ ...base, role: 'EMPLOYER', companyName: 'Acme' })).success).toBe(true);
  });

  it('rejects unknown role', () => {
    expect(registerSchema.safeParse(b({ ...base, role: 'ADMIN' })).success).toBe(false);
  });

  it('rejects invalid email', () => {
    expect(registerSchema.safeParse(b({ ...base, email: 'bad' })).success).toBe(false);
  });

  it('rejects password without uppercase letter', () => {
    expect(registerSchema.safeParse(b({ ...base, password: 'secret123' })).success).toBe(false);
  });

  it('rejects password without a digit', () => {
    expect(registerSchema.safeParse(b({ ...base, password: 'SecretPass' })).success).toBe(false);
  });

  it('rejects password shorter than 8 characters', () => {
    expect(registerSchema.safeParse(b({ ...base, password: 'S1x' })).success).toBe(false);
  });

  it('rejects missing city', () => {
    const { city: _, ...rest } = base;
    expect(registerSchema.safeParse(b(rest)).success).toBe(false);
  });

  it('rejects missing state', () => {
    const { state: _, ...rest } = base;
    expect(registerSchema.safeParse(b(rest)).success).toBe(false);
  });

  it('accepts an optional Indian mobile number', () => {
    expect(registerSchema.safeParse(b({ ...base, mobile: '9876543210' })).success).toBe(true);
  });

  it('rejects a non-Indian mobile number', () => {
    expect(registerSchema.safeParse(b({ ...base, mobile: '1234567890' })).success).toBe(false);
  });
});

// ─── loginSchema ─────────────────────────────────────────────────────────────

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    expect(loginSchema.safeParse(b({ email: 'a@b.com', password: 'pass' })).success).toBe(true);
  });

  it('rejects invalid email', () => {
    expect(loginSchema.safeParse(b({ email: 'bad', password: 'pass' })).success).toBe(false);
  });

  it('rejects empty password', () => {
    expect(loginSchema.safeParse(b({ email: 'a@b.com', password: '' })).success).toBe(false);
  });

  it('rejects missing password field', () => {
    expect(loginSchema.safeParse(b({ email: 'a@b.com' })).success).toBe(false);
  });
});

// ─── refreshSchema ────────────────────────────────────────────────────────────

describe('refreshSchema', () => {
  it('accepts a non-empty refreshToken', () => {
    expect(refreshSchema.safeParse(b({ refreshToken: 'tok' })).success).toBe(true);
  });

  it('rejects an empty refreshToken', () => {
    expect(refreshSchema.safeParse(b({ refreshToken: '' })).success).toBe(false);
  });

  it('rejects missing refreshToken field', () => {
    expect(refreshSchema.safeParse(b({})).success).toBe(false);
  });
});

// ─── verifyEmailSchema ────────────────────────────────────────────────────────

describe('verifyEmailSchema', () => {
  it('accepts a non-empty token in query', () => {
    expect(verifyEmailSchema.safeParse(q({ token: 'abc123' })).success).toBe(true);
  });

  it('rejects an empty token', () => {
    expect(verifyEmailSchema.safeParse(q({ token: '' })).success).toBe(false);
  });

  it('rejects missing token', () => {
    expect(verifyEmailSchema.safeParse(q({})).success).toBe(false);
  });
});

// ─── forgotPasswordSchema ─────────────────────────────────────────────────────

describe('forgotPasswordSchema', () => {
  it('accepts a valid email', () => {
    expect(forgotPasswordSchema.safeParse(b({ email: 'test@example.com' })).success).toBe(true);
  });

  it('rejects an invalid email', () => {
    expect(forgotPasswordSchema.safeParse(b({ email: 'bad' })).success).toBe(false);
  });

  it('rejects missing email', () => {
    expect(forgotPasswordSchema.safeParse(b({})).success).toBe(false);
  });
});

// ─── resetPasswordSchema ──────────────────────────────────────────────────────

describe('resetPasswordSchema', () => {
  const base = { token: 'reset-token', email: 'user@example.com', password: 'NewPass1' };

  it('accepts valid reset data', () => {
    expect(resetPasswordSchema.safeParse(b(base)).success).toBe(true);
  });

  it('rejects missing token', () => {
    const { token: _, ...rest } = base;
    expect(resetPasswordSchema.safeParse(b(rest)).success).toBe(false);
  });

  it('rejects invalid email', () => {
    expect(resetPasswordSchema.safeParse(b({ ...base, email: 'bad' })).success).toBe(false);
  });

  it('rejects weak password', () => {
    expect(resetPasswordSchema.safeParse(b({ ...base, password: 'weak' })).success).toBe(false);
  });

  it('rejects password without uppercase', () => {
    expect(resetPasswordSchema.safeParse(b({ ...base, password: 'newpass1' })).success).toBe(false);
  });
});

// ─── sendOtpSchema ────────────────────────────────────────────────────────────

describe('sendOtpSchema', () => {
  it('accepts a valid Indian mobile number', () => {
    expect(sendOtpSchema.safeParse(b({ mobile: '9876543210' })).success).toBe(true);
  });

  it('rejects a number not starting with 6–9', () => {
    expect(sendOtpSchema.safeParse(b({ mobile: '1234567890' })).success).toBe(false);
  });

  it('rejects fewer than 10 digits', () => {
    expect(sendOtpSchema.safeParse(b({ mobile: '987654321' })).success).toBe(false);
  });

  it('rejects more than 10 digits', () => {
    expect(sendOtpSchema.safeParse(b({ mobile: '98765432100' })).success).toBe(false);
  });

  it('rejects missing mobile field', () => {
    expect(sendOtpSchema.safeParse(b({})).success).toBe(false);
  });
});

// ─── verifyOtpSchema ─────────────────────────────────────────────────────────

describe('verifyOtpSchema', () => {
  const base = { mobile: '9876543210', otp: '123456' };

  it('accepts valid mobile + 6-digit OTP', () => {
    expect(verifyOtpSchema.safeParse(b(base)).success).toBe(true);
  });

  it('accepts optional role, firstName, lastName', () => {
    expect(
      verifyOtpSchema.safeParse(b({ ...base, role: 'EMPLOYER', firstName: 'John', lastName: 'Doe' })).success
    ).toBe(true);
  });

  it('rejects OTP shorter than 6 digits', () => {
    expect(verifyOtpSchema.safeParse(b({ ...base, otp: '12345' })).success).toBe(false);
  });

  it('rejects OTP longer than 6 digits', () => {
    expect(verifyOtpSchema.safeParse(b({ ...base, otp: '1234567' })).success).toBe(false);
  });

  it('rejects invalid mobile', () => {
    expect(verifyOtpSchema.safeParse(b({ ...base, mobile: '1234567890' })).success).toBe(false);
  });

  it('rejects invalid role', () => {
    expect(verifyOtpSchema.safeParse(b({ ...base, role: 'ADMIN' })).success).toBe(false);
  });

  it('rejects missing otp field', () => {
    expect(verifyOtpSchema.safeParse(b({ mobile: '9876543210' })).success).toBe(false);
  });
});
