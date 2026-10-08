import { z } from 'zod';

const indianMobile = z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number');

const strongPassword = z
  .string()
  .min(8, 'Minimum 8 characters')
  .regex(/[A-Z]/, 'At least one uppercase letter')
  .regex(/[0-9]/, 'At least one digit');

/**
 * Each schema validates { body, query, params } — the shape expected by validate.middleware.js.
 * Zod strips unknown top-level keys by default, so omitting `query`/`params` on body-only
 * schemas (and vice-versa) does not cause failures.
 */

export const registerSchema = z.object({
  body: z.object({
    role: z.enum(['CANDIDATE', 'EMPLOYER'], { errorMap: () => ({ message: 'Role must be CANDIDATE or EMPLOYER' }) }),
    email: z.string().email('Valid email required').optional(),
    password: strongPassword,
    mobile: indianMobile.optional(),
    firstName: z.string().min(2, 'Min 2 characters').max(50).optional(),
    lastName: z.string().min(1, 'Required').max(50).optional(),
    companyName: z.string().min(2, 'Min 2 characters').max(100).optional(),
    city: z.string().min(2, 'City required'),
    state: z.string().min(2, 'State required'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Valid email required'),
    password: z.string().min(1, 'Password required'),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token required'),
  }),
});

export const verifyEmailSchema = z.object({
  query: z.object({
    token: z.string().min(1, 'Verification token required'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Valid email required'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token required'),
    email: z.string().email('Valid email required'),
    password: strongPassword,
  }),
});

export const sendOtpSchema = z.object({
  body: z.object({
    mobile: indianMobile,
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    mobile: indianMobile,
    otp: z.string().length(6, '6-digit OTP required'),
    role: z.enum(['CANDIDATE', 'EMPLOYER']).optional(),
    firstName: z.string().max(50).optional(),
    lastName: z.string().max(50).optional(),
  }),
});
