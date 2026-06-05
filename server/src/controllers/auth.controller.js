import crypto from 'crypto';
import db from '../config/database.js';
import { hashPassword, comparePassword, hashToken, compareToken } from '../utils/hash.util.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.util.js';
import { sendOtp, verifyOtp } from '../services/otp.service.js';
import { sendVerifyEmail, sendPasswordResetEmail } from '../services/email.service.js';
import { catchAsync, AppError } from '../middleware/errorHandler.middleware.js';
import xss from 'xss';

const INDIAN_MOBILE_RE = /^[6-9]\d{9}$/;

export const register = catchAsync(async (req, res) => {
  const { email, password, mobile, role, firstName, lastName, companyName, city, state } = req.body;

  if (!['CANDIDATE', 'EMPLOYER'].includes(role)) throw new AppError('Invalid role', 400);

  if (email) {
    const exists = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (exists) throw new AppError('Email already registered', 409);
  }
  if (mobile) {
    if (!INDIAN_MOBILE_RE.test(mobile)) throw new AppError('Invalid mobile number', 400);
    const exists = await db.user.findUnique({ where: { mobile } });
    if (exists) throw new AppError('Mobile number already registered', 409);
  }

  const passwordHash = await hashPassword(password);
  const verifyToken = crypto.randomBytes(32).toString('hex');

  const baseData = { email: email?.toLowerCase(), mobile, passwordHash, role, emailVerifyToken: verifyToken, isEmailVerified: false };

  let user;
  if (role === 'CANDIDATE') {
    user = await db.user.create({
      data: { ...baseData, candidate: { create: { firstName: xss(firstName || ''), lastName: xss(lastName || ''), city: xss(city || ''), state: xss(state || '') } } },
    });
  } else {
    user = await db.user.create({
      data: { ...baseData, employer: { create: { companyName: xss(companyName || ''), city: xss(city || ''), state: xss(state || '') } } },
    });
  }

  if (email) {
    const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/verify-email?token=${verifyToken}`;
    await sendVerifyEmail(email, { name: firstName || companyName, verifyUrl }).catch(() => {});
  }

  res.status(201).json({ success: true, message: 'Registration successful. Please verify your email.', data: { userId: user.id, role: user.role } });
});

export const verifyEmail = catchAsync(async (req, res) => {
  const { token } = req.query;
  if (!token) throw new AppError('Verification token required', 400);
  const user = await db.user.findFirst({ where: { emailVerifyToken: token } });
  if (!user) throw new AppError('Invalid or expired verification token', 400);
  await db.user.update({ where: { id: user.id }, data: { isEmailVerified: true, emailVerifyToken: null } });
  res.json({ success: true, message: 'Email verified successfully' });
});

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new AppError('Email and password required', 400);
  const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !user.passwordHash) throw new AppError('Invalid credentials', 401);
  if (user.isSuspended) throw new AppError('Account suspended. Contact support.', 403);
  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) throw new AppError('Invalid credentials', 401);

  const accessToken = signAccessToken({ id: user.id, role: user.role });
  const refreshToken = signRefreshToken({ id: user.id, role: user.role });
  await db.user.update({ where: { id: user.id }, data: { refreshToken: await hashToken(refreshToken), lastLoginAt: new Date() } });

  res.json({
    success: true, message: 'Login successful',
    data: { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role, isEmailVerified: user.isEmailVerified } },
  });
});

export const refresh = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new AppError('Refresh token required', 400);
  let decoded;
  try { decoded = verifyRefreshToken(refreshToken); } catch { throw new AppError('Invalid refresh token', 401); }

  const user = await db.user.findUnique({ where: { id: decoded.id } });
  if (!user?.refreshToken) throw new AppError('Invalid refresh token', 401);
  if (!await compareToken(refreshToken, user.refreshToken)) throw new AppError('Invalid refresh token', 401);

  const newAccess = signAccessToken({ id: user.id, role: user.role });
  const newRefresh = signRefreshToken({ id: user.id, role: user.role });
  await db.user.update({ where: { id: user.id }, data: { refreshToken: await hashToken(newRefresh) } });

  res.json({ success: true, message: 'Token refreshed', data: { accessToken: newAccess, refreshToken: newRefresh } });
});

export const logout = catchAsync(async (req, res) => {
  if (req.user) await db.user.update({ where: { id: req.user.id }, data: { refreshToken: null } });
  res.json({ success: true, message: 'Logged out successfully' });
});

export const getMe = catchAsync(async (req, res) => {
  const user = await db.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true, email: true, mobile: true, role: true, isEmailVerified: true,
      isMobileVerified: true, isActive: true, createdAt: true,
      candidate: { select: { id: true, firstName: true, lastName: true, photoUrl: true, city: true, state: true, profileComplete: true, openToWork: true, planType: true, planExpiresAt: true } },
      employer: { select: { id: true, companyName: true, logoUrl: true, city: true, state: true, isVerified: true, planType: true, planExpiresAt: true, activeJobLimit: true } },
    },
  });
  if (!user) throw new AppError('User not found', 404);
  res.json({ success: true, message: 'User fetched', data: user });
});

export const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new AppError('Email required', 400);
  const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (user) {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = await hashPassword(resetToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await db.user.update({ where: { id: user.id }, data: { emailVerifyToken: `reset:${tokenHash}:${expiresAt.toISOString()}` } });
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    await sendPasswordResetEmail(email, { resetUrl }).catch(() => {});
  }
  res.json({ success: true, message: 'If this email is registered, a reset link has been sent.' });
});

export const resetPassword = catchAsync(async (req, res) => {
  const { token, email, password } = req.body;
  if (!token || !email || !password) throw new AppError('Token, email and password required', 400);
  const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user?.emailVerifyToken?.startsWith('reset:')) throw new AppError('Invalid or expired reset token', 400);
  const parts = user.emailVerifyToken.split(':');
  if (new Date() > new Date(parts[2])) throw new AppError('Reset token has expired', 400);
  if (!await comparePassword(token, parts[1])) throw new AppError('Invalid reset token', 400);
  await db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(password), emailVerifyToken: null, refreshToken: null } });
  res.json({ success: true, message: 'Password reset successfully. Please log in.' });
});

export const sendOtpHandler = catchAsync(async (req, res) => {
  const { mobile } = req.body;
  if (!mobile || !INDIAN_MOBILE_RE.test(mobile)) throw new AppError('Valid 10-digit Indian mobile number required', 400);
  const user = await db.user.findUnique({ where: { mobile } });
  await sendOtp(mobile, 'LOGIN', user?.id || null);
  res.json({ success: true, message: 'OTP sent successfully' });
});

export const verifyOtpHandler = catchAsync(async (req, res) => {
  const { mobile, otp, firstName, lastName, role } = req.body;
  if (!mobile || !otp) throw new AppError('Mobile and OTP required', 400);
  const valid = await verifyOtp(mobile, otp, 'LOGIN');
  if (!valid) throw new AppError('Invalid or expired OTP', 400);

  let user = await db.user.findUnique({ where: { mobile } });
  let isNewUser = false;

  if (!user) {
    isNewUser = true;
    const regRole = ['CANDIDATE', 'EMPLOYER'].includes(role) ? role : 'CANDIDATE';
    user = await db.user.create({
      data: {
        mobile, role: regRole, isMobileVerified: true, isActive: true,
        candidate: regRole === 'CANDIDATE' ? { create: { firstName: xss(firstName || ''), lastName: xss(lastName || ''), city: '', state: '' } } : undefined,
        employer: regRole === 'EMPLOYER' ? { create: { companyName: '', city: '', state: '' } } : undefined,
      },
    });
  } else {
    await db.user.update({ where: { id: user.id }, data: { isMobileVerified: true, lastLoginAt: new Date() } });
  }

  const accessToken = signAccessToken({ id: user.id, role: user.role });
  const refreshToken = signRefreshToken({ id: user.id, role: user.role });
  await db.user.update({ where: { id: user.id }, data: { refreshToken: await hashToken(refreshToken) } });

  res.json({ success: true, message: isNewUser ? 'Account created' : 'Login successful', data: { accessToken, refreshToken, isNewUser, user: { id: user.id, mobile: user.mobile, role: user.role } } });
});
