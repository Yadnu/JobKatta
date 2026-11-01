import crypto from 'crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// ─── mock database ────────────────────────────────────────────────────────────
const userFindUniqueMock = vi.fn();
const userFindFirstMock = vi.fn();
const userCreateMock = vi.fn();
const userUpdateMock = vi.fn();

vi.mock('../config/database.js', () => ({
  default: {
    user: {
      findUnique: userFindUniqueMock,
      findFirst: userFindFirstMock,
      create: userCreateMock,
      update: userUpdateMock,
    },
  },
}));

// ─── mock hash + jwt ──────────────────────────────────────────────────────────
const hashPasswordMock = vi.fn();
const comparePasswordMock = vi.fn();
const hashTokenMock = vi.fn();
const compareTokenMock = vi.fn();

vi.mock('../utils/hash.util.js', () => ({
  hashPassword: hashPasswordMock,
  comparePassword: comparePasswordMock,
  hashToken: hashTokenMock,
  compareToken: compareTokenMock,
}));

const signAccessTokenMock = vi.fn();
const signRefreshTokenMock = vi.fn();
const verifyRefreshTokenMock = vi.fn();

vi.mock('../utils/jwt.util.js', () => ({
  signAccessToken: signAccessTokenMock,
  signRefreshToken: signRefreshTokenMock,
  verifyRefreshToken: verifyRefreshTokenMock,
}));

// ─── mock otp + email ─────────────────────────────────────────────────────────
const sendOtpMock = vi.fn();
const verifyOtpMock = vi.fn();

vi.mock('../services/otp.service.js', () => ({
  sendOtp: sendOtpMock,
  verifyOtp: verifyOtpMock,
}));

const deliverVerifyEmailMock = vi.fn();
const deliverPasswordResetEmailMock = vi.fn();

vi.mock('../services/email.service.js', () => ({
  deliverVerifyEmail: deliverVerifyEmailMock,
  deliverPasswordResetEmail: deliverPasswordResetEmailMock,
}));

vi.mock('xss', () => ({ default: (s) => `safe:${s}` }));

const {
  register,
  verifyEmail,
  login,
  refresh,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  sendOtpHandler,
  verifyOtpHandler,
} = await import('./auth.controller.js');

const makeRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const expectStatus = (next, statusCode) => {
  expect(next).toHaveBeenCalledOnce();
  expect(next.mock.calls[0][0].statusCode).toBe(statusCode);
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(crypto, 'randomBytes').mockReturnValue({ toString: () => 'fixedtoken' });
  process.env.CLIENT_URL = 'http://localhost:3000';

  hashPasswordMock.mockResolvedValue('hashed-pw');
  comparePasswordMock.mockResolvedValue(true);
  hashTokenMock.mockResolvedValue('hashed-refresh');
  compareTokenMock.mockResolvedValue(true);
  signAccessTokenMock.mockReturnValue('access-token');
  signRefreshTokenMock.mockReturnValue('refresh-token');
  verifyRefreshTokenMock.mockReturnValue({ id: 'user-1', role: 'CANDIDATE' });
  sendOtpMock.mockResolvedValue('123456');
  verifyOtpMock.mockResolvedValue(true);
  deliverVerifyEmailMock.mockResolvedValue({ ok: true });
  deliverPasswordResetEmailMock.mockResolvedValue({ ok: true });
  userUpdateMock.mockResolvedValue({});
});

// ─── register ─────────────────────────────────────────────────────────────────

describe('register', () => {
  it('returns 400 for an invalid role', async () => {
    const next = vi.fn();
    await register({ body: { role: 'ADMIN', password: 'secret' } }, makeRes(), next);
    expectStatus(next, 400);
    expect(userCreateMock).not.toHaveBeenCalled();
  });

  it('returns 409 when the email is already registered', async () => {
    userFindUniqueMock.mockResolvedValueOnce({ id: 'existing' });
    const next = vi.fn();
    await register(
      { body: { role: 'CANDIDATE', email: 'ada@mail.com', password: 'secret' } },
      makeRes(),
      next,
    );
    expectStatus(next, 409);
    expect(userFindUniqueMock).toHaveBeenCalledWith({ where: { email: 'ada@mail.com' } });
  });

  it('returns 400 for an invalid Indian mobile number', async () => {
    const next = vi.fn();
    await register(
      { body: { role: 'CANDIDATE', mobile: '12345', password: 'secret' } },
      makeRes(),
      next,
    );
    expectStatus(next, 400);
    expect(userCreateMock).not.toHaveBeenCalled();
  });

  it('returns 409 when the mobile number is already registered', async () => {
    userFindUniqueMock.mockResolvedValueOnce({ id: 'existing' });
    const next = vi.fn();
    await register(
      { body: { role: 'CANDIDATE', mobile: '9876543210', password: 'secret' } },
      makeRes(),
      next,
    );
    expectStatus(next, 409);
  });

  it('creates a candidate, sends the verify email, and responds 201', async () => {
    userFindUniqueMock.mockResolvedValue(null);
    userCreateMock.mockResolvedValue({ id: 'user-1', role: 'CANDIDATE' });

    const res = makeRes();
    await register(
      {
        body: {
          role: 'CANDIDATE',
          email: 'Ada@Mail.com',
          password: 'secret',
          mobile: '9876543210',
          firstName: 'Ada',
          lastName: 'Lovelace',
          city: 'Pune',
          state: 'MH',
        },
      },
      res,
      vi.fn(),
    );

    expect(userCreateMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: 'ada@mail.com',
        mobile: '9876543210',
        passwordHash: 'hashed-pw',
        role: 'CANDIDATE',
        emailVerifyToken: 'fixedtoken',
        isEmailVerified: false,
        candidate: {
          create: {
            firstName: 'safe:Ada',
            lastName: 'safe:Lovelace',
            city: 'safe:Pune',
            state: 'safe:MH',
          },
        },
      }),
    });
    expect(deliverVerifyEmailMock).toHaveBeenCalledWith(
      'Ada@Mail.com',
      {
        name: 'Ada',
        verifyUrl: 'http://localhost:3000/auth/verify-email?token=fixedtoken',
      },
      { userId: 'user-1' },
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Registration successful. Please verify your email.',
      data: { userId: 'user-1', role: 'CANDIDATE' },
    });
  });

  it('creates an employer profile when role is EMPLOYER', async () => {
    userFindUniqueMock.mockResolvedValue(null);
    userCreateMock.mockResolvedValue({ id: 'user-2', role: 'EMPLOYER' });

    await register(
      {
        body: {
          role: 'EMPLOYER',
          email: 'hr@acme.com',
          password: 'secret',
          companyName: 'Acme',
          city: 'Mumbai',
          state: 'MH',
        },
      },
      makeRes(),
      vi.fn(),
    );

    expect(userCreateMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        role: 'EMPLOYER',
        employer: {
          create: { companyName: 'safe:Acme', city: 'safe:Mumbai', state: 'safe:MH' },
        },
      }),
    });
  });

  it('still returns 201 and flags delivery failure when the verify email cannot be sent', async () => {
    userFindUniqueMock.mockResolvedValue(null);
    userCreateMock.mockResolvedValue({ id: 'user-1', role: 'CANDIDATE' });
    deliverVerifyEmailMock.mockResolvedValue({ ok: false });

    const res = makeRes();
    await register(
      { body: { role: 'CANDIDATE', email: 'ada@mail.com', password: 'secret', firstName: 'Ada' } },
      res,
      vi.fn(),
    );

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: { userId: 'user-1', role: 'CANDIDATE', emailDeliveryFailed: true } }),
    );
  });

  it('skips the verify email when no email address is provided', async () => {
    userFindUniqueMock.mockResolvedValue(null);
    userCreateMock.mockResolvedValue({ id: 'user-1', role: 'CANDIDATE' });

    const res = makeRes();
    await register(
      { body: { role: 'CANDIDATE', mobile: '9876543210', password: 'secret' } },
      res,
      vi.fn(),
    );

    expect(deliverVerifyEmailMock).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });
});

// ─── verifyEmail ──────────────────────────────────────────────────────────────

describe('verifyEmail', () => {
  it('returns 400 when the token query param is missing', async () => {
    const next = vi.fn();
    await verifyEmail({ query: {} }, makeRes(), next);
    expectStatus(next, 400);
  });

  it('returns 400 when the token does not match a user', async () => {
    userFindFirstMock.mockResolvedValue(null);
    const next = vi.fn();
    await verifyEmail({ query: { token: 'nope' } }, makeRes(), next);
    expectStatus(next, 400);
    expect(userUpdateMock).not.toHaveBeenCalled();
  });

  it('marks the email verified and clears the token', async () => {
    userFindFirstMock.mockResolvedValue({ id: 'user-1' });
    const res = makeRes();
    await verifyEmail({ query: { token: 'fixedtoken' } }, res, vi.fn());

    expect(userUpdateMock).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { isEmailVerified: true, emailVerifyToken: null },
    });
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Email verified successfully' });
  });
});

// ─── login ────────────────────────────────────────────────────────────────────

describe('login', () => {
  it('returns 400 when email or password is missing', async () => {
    const next = vi.fn();
    await login({ body: { email: 'ada@mail.com' } }, makeRes(), next);
    expectStatus(next, 400);
  });

  it('returns 401 when the user does not exist', async () => {
    userFindUniqueMock.mockResolvedValue(null);
    const next = vi.fn();
    await login({ body: { email: 'Ada@Mail.com', password: 'secret' } }, makeRes(), next);
    expectStatus(next, 401);
    expect(userFindUniqueMock).toHaveBeenCalledWith({ where: { email: 'ada@mail.com' } });
  });

  it('returns 401 when the account has no password hash', async () => {
    userFindUniqueMock.mockResolvedValue({ id: 'user-1', passwordHash: null });
    const next = vi.fn();
    await login({ body: { email: 'ada@mail.com', password: 'secret' } }, makeRes(), next);
    expectStatus(next, 401);
  });

  it('returns 403 when the account is suspended', async () => {
    userFindUniqueMock.mockResolvedValue({ id: 'user-1', passwordHash: 'hashed-pw', isSuspended: true });
    const next = vi.fn();
    await login({ body: { email: 'ada@mail.com', password: 'secret' } }, makeRes(), next);
    expectStatus(next, 403);
  });

  it('returns 401 when the password does not match', async () => {
    userFindUniqueMock.mockResolvedValue({ id: 'user-1', passwordHash: 'hashed-pw', isSuspended: false });
    comparePasswordMock.mockResolvedValue(false);
    const next = vi.fn();
    await login({ body: { email: 'ada@mail.com', password: 'wrong' } }, makeRes(), next);
    expectStatus(next, 401);
  });

  it('issues tokens and stores a hashed refresh token', async () => {
    const user = {
      id: 'user-1',
      email: 'ada@mail.com',
      role: 'CANDIDATE',
      passwordHash: 'hashed-pw',
      isSuspended: false,
      isEmailVerified: true,
    };
    userFindUniqueMock.mockResolvedValue(user);

    const res = makeRes();
    await login({ body: { email: 'ada@mail.com', password: 'secret' } }, res, vi.fn());

    expect(signAccessTokenMock).toHaveBeenCalledWith({ id: 'user-1', role: 'CANDIDATE' });
    expect(signRefreshTokenMock).toHaveBeenCalledWith({ id: 'user-1', role: 'CANDIDATE' });
    expect(userUpdateMock).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { refreshToken: 'hashed-refresh', lastLoginAt: expect.any(Date) },
    });
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Login successful',
      data: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: { id: 'user-1', email: 'ada@mail.com', role: 'CANDIDATE', isEmailVerified: true },
      },
    });
  });
});

// ─── refresh ──────────────────────────────────────────────────────────────────

describe('refresh', () => {
  it('returns 400 when the refresh token is missing', async () => {
    const next = vi.fn();
    await refresh({ body: {} }, makeRes(), next);
    expectStatus(next, 400);
  });

  it('returns 401 when the refresh token cannot be verified', async () => {
    verifyRefreshTokenMock.mockImplementation(() => {
      throw new Error('jwt malformed');
    });
    const next = vi.fn();
    await refresh({ body: { refreshToken: 'bad' } }, makeRes(), next);
    expectStatus(next, 401);
  });

  it('returns 401 when the user has no stored refresh token', async () => {
    userFindUniqueMock.mockResolvedValue({ id: 'user-1', refreshToken: null });
    const next = vi.fn();
    await refresh({ body: { refreshToken: 'old' } }, makeRes(), next);
    expectStatus(next, 401);
  });

  it('returns 401 when the stored hash does not match', async () => {
    userFindUniqueMock.mockResolvedValue({ id: 'user-1', refreshToken: 'stored' });
    compareTokenMock.mockResolvedValue(false);
    const next = vi.fn();
    await refresh({ body: { refreshToken: 'old' } }, makeRes(), next);
    expectStatus(next, 401);
    expect(userUpdateMock).not.toHaveBeenCalled();
  });

  it('rotates the access and refresh tokens', async () => {
    userFindUniqueMock.mockResolvedValue({ id: 'user-1', role: 'EMPLOYER', refreshToken: 'stored' });
    const res = makeRes();
    await refresh({ body: { refreshToken: 'old' } }, res, vi.fn());

    expect(compareTokenMock).toHaveBeenCalledWith('old', 'stored');
    expect(userUpdateMock).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { refreshToken: 'hashed-refresh' },
    });
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Token refreshed',
      data: { accessToken: 'access-token', refreshToken: 'refresh-token' },
    });
  });
});

// ─── logout + getMe ───────────────────────────────────────────────────────────

describe('logout', () => {
  it('clears the stored refresh token for the authenticated user', async () => {
    const res = makeRes();
    await logout({ user: { id: 'user-1' } }, res, vi.fn());
    expect(userUpdateMock).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { refreshToken: null },
    });
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Logged out successfully' });
  });

  it('succeeds without a database write when no user is attached', async () => {
    const res = makeRes();
    await logout({}, res, vi.fn());
    expect(userUpdateMock).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});

describe('getMe', () => {
  it('returns the authenticated user profile', async () => {
    const user = { id: 'user-1', email: 'ada@mail.com', role: 'CANDIDATE' };
    userFindUniqueMock.mockResolvedValue(user);
    const res = makeRes();
    await getMe({ user: { id: 'user-1' } }, res, vi.fn());

    expect(userFindUniqueMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'user-1' } }),
    );
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'User fetched', data: user });
  });

  it('returns 404 when the user record is gone', async () => {
    userFindUniqueMock.mockResolvedValue(null);
    const next = vi.fn();
    await getMe({ user: { id: 'missing' } }, makeRes(), next);
    expectStatus(next, 404);
  });
});

// ─── forgotPassword ───────────────────────────────────────────────────────────

describe('forgotPassword', () => {
  it('returns 400 when email is missing', async () => {
    const next = vi.fn();
    await forgotPassword({ body: {} }, makeRes(), next);
    expectStatus(next, 400);
  });

  it('responds with the generic message when the email is not registered', async () => {
    userFindUniqueMock.mockResolvedValue(null);
    const res = makeRes();
    await forgotPassword({ body: { email: 'nobody@mail.com' } }, res, vi.fn());

    expect(userUpdateMock).not.toHaveBeenCalled();
    expect(deliverPasswordResetEmailMock).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'If this email is registered, a reset link has been sent.',
    });
  });

  it('stores a reset token and emails the reset link', async () => {
    userFindUniqueMock.mockResolvedValue({ id: 'user-1' });
    const res = makeRes();
    await forgotPassword({ body: { email: 'Ada@Mail.com' } }, res, vi.fn());

    expect(userUpdateMock).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { emailVerifyToken: expect.stringMatching(/^reset:hashed-pw:/) },
    });
    expect(deliverPasswordResetEmailMock).toHaveBeenCalledWith(
      'Ada@Mail.com',
      { resetUrl: expect.stringContaining('token=fixedtoken&email=Ada%40Mail.com') },
      { userId: 'user-1' },
    );
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'If this email is registered, a reset link has been sent.',
    });
  });

  it('clears the reset token and flags delivery failure when the email cannot be sent', async () => {
    userFindUniqueMock.mockResolvedValue({ id: 'user-1' });
    deliverPasswordResetEmailMock.mockResolvedValue({ ok: false });
    const res = makeRes();
    await forgotPassword({ body: { email: 'ada@mail.com' } }, res, vi.fn());

    expect(userUpdateMock).toHaveBeenLastCalledWith({
      where: { id: 'user-1' },
      data: { emailVerifyToken: null },
    });
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: { emailDeliveryFailed: true } }),
    );
  });
});

// ─── resetPassword ────────────────────────────────────────────────────────────

describe('resetPassword', () => {
  it('returns 400 when token, email, or password is missing', async () => {
    const next = vi.fn();
    await resetPassword({ body: { email: 'ada@mail.com', password: 'new' } }, makeRes(), next);
    expectStatus(next, 400);
  });

  it('returns 400 when the user has no reset token', async () => {
    userFindUniqueMock.mockResolvedValue({ id: 'user-1', emailVerifyToken: null });
    const next = vi.fn();
    await resetPassword(
      { body: { token: 'fixedtoken', email: 'ada@mail.com', password: 'new-secret' } },
      makeRes(),
      next,
    );
    expectStatus(next, 400);
  });

  it('returns 400 when the reset token has expired', async () => {
    userFindUniqueMock.mockResolvedValue({
      id: 'user-1',
      emailVerifyToken: 'reset:stored-hash:2000-01-01',
    });
    const next = vi.fn();
    await resetPassword(
      { body: { token: 'fixedtoken', email: 'ada@mail.com', password: 'new-secret' } },
      makeRes(),
      next,
    );
    expectStatus(next, 400);
    expect(userUpdateMock).not.toHaveBeenCalled();
  });

  it('returns 400 when the reset token does not match', async () => {
    userFindUniqueMock.mockResolvedValue({
      id: 'user-1',
      emailVerifyToken: 'reset:stored-hash:2099-01-01',
    });
    comparePasswordMock.mockResolvedValue(false);
    const next = vi.fn();
    await resetPassword(
      { body: { token: 'wrong', email: 'ada@mail.com', password: 'new-secret' } },
      makeRes(),
      next,
    );
    expectStatus(next, 400);
  });

  it('replaces the password and clears session tokens', async () => {
    userFindUniqueMock.mockResolvedValue({
      id: 'user-1',
      emailVerifyToken: 'reset:stored-hash:2099-01-01',
    });
    hashPasswordMock.mockResolvedValue('new-hash');
    const res = makeRes();
    await resetPassword(
      { body: { token: 'fixedtoken', email: 'Ada@Mail.com', password: 'new-secret' } },
      res,
      vi.fn(),
    );

    expect(comparePasswordMock).toHaveBeenCalledWith('fixedtoken', 'stored-hash');
    expect(userUpdateMock).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { passwordHash: 'new-hash', emailVerifyToken: null, refreshToken: null },
    });
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Password reset successfully. Please log in.',
    });
  });
});

// ─── OTP ──────────────────────────────────────────────────────────────────────

describe('sendOtpHandler', () => {
  it('returns 400 for a mobile number that is not a 10-digit Indian number', async () => {
    const next = vi.fn();
    await sendOtpHandler({ body: { mobile: '5876543210' } }, makeRes(), next);
    expectStatus(next, 400);
    expect(sendOtpMock).not.toHaveBeenCalled();
  });

  it('sends a login OTP for an existing user', async () => {
    userFindUniqueMock.mockResolvedValue({ id: 'user-1' });
    const res = makeRes();
    await sendOtpHandler({ body: { mobile: '9876543210' } }, res, vi.fn());

    expect(sendOtpMock).toHaveBeenCalledWith('9876543210', 'LOGIN', 'user-1');
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'OTP sent successfully' });
  });

  it('sends a login OTP with a null user id when the mobile is not registered', async () => {
    userFindUniqueMock.mockResolvedValue(null);
    await sendOtpHandler({ body: { mobile: '9876543210' } }, makeRes(), vi.fn());
    expect(sendOtpMock).toHaveBeenCalledWith('9876543210', 'LOGIN', null);
  });
});

describe('verifyOtpHandler', () => {
  it('returns 400 when mobile or otp is missing', async () => {
    const next = vi.fn();
    await verifyOtpHandler({ body: { mobile: '9876543210' } }, makeRes(), next);
    expectStatus(next, 400);
  });

  it('returns 400 when the OTP is invalid', async () => {
    verifyOtpMock.mockResolvedValue(false);
    const next = vi.fn();
    await verifyOtpHandler({ body: { mobile: '9876543210', otp: '000000' } }, makeRes(), next);
    expectStatus(next, 400);
    expect(verifyOtpMock).toHaveBeenCalledWith('9876543210', '000000', 'LOGIN');
  });

  it('logs in an existing user', async () => {
    userFindUniqueMock.mockResolvedValue({ id: 'user-1', mobile: '9876543210', role: 'CANDIDATE' });
    const res = makeRes();
    await verifyOtpHandler({ body: { mobile: '9876543210', otp: '123456' } }, res, vi.fn());

    expect(userUpdateMock).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { isMobileVerified: true, lastLoginAt: expect.any(Date) },
    });
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Login successful',
        data: expect.objectContaining({
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          isNewUser: false,
        }),
      }),
    );
  });

  it('creates a candidate account when the mobile is new', async () => {
    userFindUniqueMock.mockResolvedValue(null);
    userCreateMock.mockResolvedValue({ id: 'user-9', mobile: '9876543210', role: 'CANDIDATE' });

    const res = makeRes();
    await verifyOtpHandler(
      { body: { mobile: '9876543210', otp: '123456', firstName: 'Ada', lastName: 'L', role: 'NOPE' } },
      res,
      vi.fn(),
    );

    expect(userCreateMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        mobile: '9876543210',
        role: 'CANDIDATE',
        isMobileVerified: true,
        candidate: { create: { firstName: 'safe:Ada', lastName: 'safe:L', city: '', state: '' } },
      }),
    });
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Account created' }));
  });

  it('creates an employer account when a new mobile registers as EMPLOYER', async () => {
    userFindUniqueMock.mockResolvedValue(null);
    userCreateMock.mockResolvedValue({ id: 'user-8', mobile: '9876543210', role: 'EMPLOYER' });

    await verifyOtpHandler(
      { body: { mobile: '9876543210', otp: '123456', role: 'EMPLOYER' } },
      makeRes(),
      vi.fn(),
    );

    expect(userCreateMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        role: 'EMPLOYER',
        employer: { create: { companyName: '', city: '', state: '' } },
        candidate: undefined,
      }),
    });
  });
});
