import { describe, expect, it } from 'vitest';
import {
  educationSchema,
  experienceSchema,
  forgotPasswordSchema,
  jobPostSchema,
  loginSchema,
  otpSchema,
  preferencesSchema,
  registerSchema,
  resetPasswordSchema,
  verifyOtpSchema,
} from './validations';

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
    expect(registerSchema.safeParse(base).success).toBe(true);
  });

  it('accepts EMPLOYER role', () => {
    expect(registerSchema.safeParse({ ...base, role: 'EMPLOYER' }).success).toBe(true);
  });

  it('rejects an unknown role', () => {
    expect(registerSchema.safeParse({ ...base, role: 'ADMIN' }).success).toBe(false);
  });

  it('rejects an invalid email', () => {
    expect(registerSchema.safeParse({ ...base, email: 'not-an-email' }).success).toBe(false);
  });

  it('rejects password shorter than 8 characters', () => {
    expect(registerSchema.safeParse({ ...base, password: 'S1x' }).success).toBe(false);
  });

  it('rejects password without an uppercase letter', () => {
    expect(registerSchema.safeParse({ ...base, password: 'secret123' }).success).toBe(false);
  });

  it('rejects password without a digit', () => {
    expect(registerSchema.safeParse({ ...base, password: 'SecretPass' }).success).toBe(false);
  });

  it('rejects missing city', () => {
    const { city: _, ...rest } = base;
    expect(registerSchema.safeParse(rest).success).toBe(false);
  });
});

// ─── loginSchema ─────────────────────────────────────────────────────────────

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: 'anything' }).success).toBe(true);
  });

  it('rejects an invalid email', () => {
    expect(loginSchema.safeParse({ email: 'bad', password: 'ok' }).success).toBe(false);
  });

  it('rejects an empty password', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: '' }).success).toBe(false);
  });
});

// ─── otpSchema ────────────────────────────────────────────────────────────────

describe('otpSchema', () => {
  it('accepts a valid 10-digit mobile starting with 6–9', () => {
    expect(otpSchema.safeParse({ mobile: '9876543210' }).success).toBe(true);
    expect(otpSchema.safeParse({ mobile: '6000000000' }).success).toBe(true);
  });

  it('rejects a number starting with 1–5', () => {
    expect(otpSchema.safeParse({ mobile: '1234567890' }).success).toBe(false);
    expect(otpSchema.safeParse({ mobile: '5876543210' }).success).toBe(false);
  });

  it('rejects fewer than 10 digits', () => {
    expect(otpSchema.safeParse({ mobile: '987654321' }).success).toBe(false);
  });

  it('rejects more than 10 digits', () => {
    expect(otpSchema.safeParse({ mobile: '98765432100' }).success).toBe(false);
  });

  it('rejects non-numeric input', () => {
    expect(otpSchema.safeParse({ mobile: 'abcdefghij' }).success).toBe(false);
  });
});

// ─── verifyOtpSchema ─────────────────────────────────────────────────────────

describe('verifyOtpSchema', () => {
  const validMobile = '9876543210';

  it('accepts a valid mobile + 6-digit OTP', () => {
    expect(verifyOtpSchema.safeParse({ mobile: validMobile, otp: '123456' }).success).toBe(true);
  });

  it('rejects an OTP shorter than 6 digits', () => {
    expect(verifyOtpSchema.safeParse({ mobile: validMobile, otp: '12345' }).success).toBe(false);
  });

  it('rejects an OTP longer than 6 digits', () => {
    expect(verifyOtpSchema.safeParse({ mobile: validMobile, otp: '1234567' }).success).toBe(false);
  });

  it('rejects an invalid mobile alongside a valid OTP', () => {
    expect(verifyOtpSchema.safeParse({ mobile: '1234567890', otp: '123456' }).success).toBe(false);
  });
});

// ─── forgotPasswordSchema ─────────────────────────────────────────────────────

describe('forgotPasswordSchema', () => {
  it('accepts a valid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'test@example.com' }).success).toBe(true);
  });

  it('rejects an invalid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'bad-email' }).success).toBe(false);
  });

  it('rejects a missing email', () => {
    expect(forgotPasswordSchema.safeParse({}).success).toBe(false);
  });
});

// ─── resetPasswordSchema ──────────────────────────────────────────────────────

describe('resetPasswordSchema', () => {
  it('accepts matching valid passwords', () => {
    expect(
      resetPasswordSchema.safeParse({ password: 'NewPass1', confirmPassword: 'NewPass1' }).success
    ).toBe(true);
  });

  it('rejects when passwords do not match', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'NewPass1',
      confirmPassword: 'Different1',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('confirmPassword');
      expect(result.error.issues[0].message).toBe('Passwords do not match');
    }
  });

  it('rejects a password without uppercase', () => {
    expect(
      resetPasswordSchema.safeParse({ password: 'newpass1', confirmPassword: 'newpass1' }).success
    ).toBe(false);
  });
});

// ─── educationSchema ─────────────────────────────────────────────────────────

describe('educationSchema', () => {
  const base = {
    degree: 'BSc Computer Science',
    institution: 'MIT',
    startYear: 2018,
    isCurrently: false,
  };

  it('accepts a minimal valid education entry', () => {
    expect(educationSchema.safeParse(base).success).toBe(true);
  });

  it('accepts optional fields', () => {
    expect(
      educationSchema.safeParse({ ...base, fieldOfStudy: 'CS', percentage: 85, endYear: 2022 }).success
    ).toBe(true);
  });

  it('rejects percentage above 100', () => {
    expect(educationSchema.safeParse({ ...base, percentage: 110 }).success).toBe(false);
  });

  it('rejects percentage below 0', () => {
    expect(educationSchema.safeParse({ ...base, percentage: -1 }).success).toBe(false);
  });

  it('rejects startYear before 1980', () => {
    expect(educationSchema.safeParse({ ...base, startYear: 1979 }).success).toBe(false);
  });

  it('rejects startYear after the current year', () => {
    expect(
      educationSchema.safeParse({ ...base, startYear: new Date().getFullYear() + 1 }).success
    ).toBe(false);
  });

  it('rejects missing degree', () => {
    const { degree: _, ...rest } = base;
    expect(educationSchema.safeParse(rest).success).toBe(false);
  });
});

// ─── experienceSchema ────────────────────────────────────────────────────────

describe('experienceSchema', () => {
  const base = {
    jobTitle: 'Software Engineer',
    companyName: 'Acme Corp',
    startDate: '2021-01-01',
    isCurrent: false,
  };

  it('accepts a minimal valid experience entry', () => {
    expect(experienceSchema.safeParse(base).success).toBe(true);
  });

  it('accepts all optional fields', () => {
    expect(
      experienceSchema.safeParse({
        ...base,
        city: 'Pune',
        employmentType: 'FULL_TIME',
        endDate: '2023-01-01',
        description: 'Worked on many things',
      }).success
    ).toBe(true);
  });

  it('rejects invalid employmentType', () => {
    expect(experienceSchema.safeParse({ ...base, employmentType: 'GIG' }).success).toBe(false);
  });

  it('rejects jobTitle shorter than 2 characters', () => {
    expect(experienceSchema.safeParse({ ...base, jobTitle: 'A' }).success).toBe(false);
  });
});

// ─── preferencesSchema ───────────────────────────────────────────────────────

describe('preferencesSchema', () => {
  it('accepts a valid preferences object', () => {
    expect(preferencesSchema.safeParse({ openToWork: true }).success).toBe(true);
  });

  it('rejects when openToWork is missing', () => {
    expect(preferencesSchema.safeParse({}).success).toBe(false);
  });

  it('rejects negative expectedSalaryMin', () => {
    expect(
      preferencesSchema.safeParse({ openToWork: true, expectedSalaryMin: -1 }).success
    ).toBe(false);
  });
});

// ─── jobPostSchema ───────────────────────────────────────────────────────────

describe('jobPostSchema', () => {
  const base = {
    title: 'Senior Developer',
    category: 'Technology',
    employmentType: 'FULL_TIME',
    description: 'A'.repeat(100),
    city: 'Bangalore',
    state: 'Karnataka',
    skills: ['React', 'TypeScript'],
  };

  it('accepts a valid job post', () => {
    expect(jobPostSchema.safeParse(base).success).toBe(true);
  });

  it('rejects a title shorter than 5 characters', () => {
    expect(jobPostSchema.safeParse({ ...base, title: 'Dev' }).success).toBe(false);
  });

  it('rejects a description shorter than 100 characters', () => {
    expect(jobPostSchema.safeParse({ ...base, description: 'Too short' }).success).toBe(false);
  });

  it('rejects an empty skills array', () => {
    expect(jobPostSchema.safeParse({ ...base, skills: [] }).success).toBe(false);
  });

  it('rejects an invalid employmentType', () => {
    expect(jobPostSchema.safeParse({ ...base, employmentType: 'GIG' }).success).toBe(false);
  });

  it('rejects when category is empty', () => {
    expect(jobPostSchema.safeParse({ ...base, category: '' }).success).toBe(false);
  });

  it('rejects city shorter than 2 characters', () => {
    expect(jobPostSchema.safeParse({ ...base, city: 'A' }).success).toBe(false);
  });
});
